import { Request } from "express";
import { FindOptions, Order } from "sequelize";
import "module-alias/register";
import { PermissionRole, PermissionRoleAuthorize } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { StdQueryListResult } from "@/types/queryTypes";
import BaseService from "../BaseService";

// TODO: Move to wf_common
const PERMISSION_ROLE_ATTRS = ["id", "name", "description", "status"];
const PERMISSION_ROLE_AUTHORIZE_ATTRS = ["page", "read", "write"];

class PermissionRoleService extends BaseService {
    constructor(req: Request) {
        super(req);
    }

    async getPermissionRoleList(options?: FindOptions<PermissionRole>): Promise<StdQueryListResult<PermissionRole>> {
        const roles = await PermissionRole.findAndCountAll({
            attributes: PERMISSION_ROLE_ATTRS,
            ...options,
        }).catch((error) => {
            throw error;
        });
        const { count, rows: data } = roles;
        return { count, data };
    }

    async getPermissionRolePickerList(
        str?: string,
        filter?: string[],
        order?: Order,
        options?: FindOptions<PermissionRole>
    ): Promise<StdQueryListResult<PermissionRole>> {
        const whereSearch = createWhereFormSearchable(["name", "description"], str);
        const whereFilter = createWhereFormFilter(PERMISSION_ROLE_ATTRS, filter);
        const mWhere = { ...whereSearch, ...whereFilter };
        return this.getPermissionRoleList({
            offset: this.page.offset,
            limit: this.page.limit,
            where: mWhere,
            order: order,
            ...options,
        });
    }

    async getPermissionRole(id: number): Promise<PermissionRole> {
        return await PermissionRole.findByPk(id, {
            attributes: PERMISSION_ROLE_ATTRS,
            include: [
                {
                    model: PermissionRoleAuthorize,
                    attributes: PERMISSION_ROLE_AUTHORIZE_ATTRS,
                },
            ],
        });
    }

    async createPermissionRole(roleData: PermissionRole): Promise<PermissionRole> {
        const { sequelize } = this.domainDBResource;
        const permissionRole = await sequelize
            .transaction(async (transaction) => {
                const { employeeId } = this.req.user;
                const creator = {
                    createdUser: employeeId,
                    updatedUser: employeeId,
                };
                const authorizesWithCreator = roleData.permissionRoleAuthorizes.map((authorize) => {
                    return {
                        ...authorize,
                        ...creator,
                    } as PermissionRoleAuthorize;
                });
                roleData.permissionRoleAuthorizes = authorizesWithCreator;
                return await PermissionRole.create(
                    {
                        ...roleData,
                        ...creator,
                    },
                    {
                        include: [PermissionRoleAuthorize],
                        transaction,
                    }
                );
            })
            .catch((error) => {
                throw error;
            });
        return permissionRole;
    }

    async updatePermissionRole(roleData: PermissionRole): Promise<PermissionRole> {
        const { sequelize } = this.domainDBResource;
        const permissionRole = await sequelize
            .transaction(async (transaction) => {
                const { id, name, description, status, permissionRoleAuthorizes } = roleData;
                const role = await PermissionRole.findByPk(id);
                const { employeeId } = this.req.user;
                const updater = {
                    createdUser: role.createdUser,
                    updatedUser: employeeId,
                };
                await role.update(
                    {
                        name,
                        description,
                        status,
                        ...updater,
                    },
                    { transaction }
                );
                await PermissionRoleAuthorize.destroy({
                    where: {
                        permissionRoleId: id,
                    },
                    transaction,
                });
                await PermissionRoleAuthorize.bulkCreate(
                    permissionRoleAuthorizes.map((authorize) => {
                        return {
                            permissionRoleId: id,
                            ...authorize,
                            ...updater,
                        };
                    }),
                    { transaction }
                );
                return role;
            })
            .catch((error) => {
                console.log(error);
                throw error;
            });
        return permissionRole;
    }

    async deletePermissionRole(id: number): Promise<PermissionRole | void> {
        const { sequelize } = this.domainDBResource;
        const permissionRole = await sequelize
            .transaction(async (transaction) => {
                const role = await PermissionRole.findByPk(id);
                PermissionRoleAuthorize.destroy({
                    where: {
                        permissionRoleId: id,
                    },
                    transaction,
                });
                return await role.destroy({ transaction });
            })
            .catch((error) => {
                throw error;
            });
        return permissionRole;
    }
}

export default PermissionRoleService;
