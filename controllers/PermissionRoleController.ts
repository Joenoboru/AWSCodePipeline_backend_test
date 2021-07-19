import { Request, Response, Router } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import handleErrorAsync from "./handleErrorAsync";
import { ListQueryParams } from "../types/queryTypes";
import PermissionRoleService from "../services/PermissionRoleService";

const router = Router();

router.get(
    "",
    handleErrorAsync(async (req: Request, res: Response) => {
        const permissionRoleService = new PermissionRoleService(req);
        const result = await permissionRoleService
            .getPermissionRoleList()
            .then((permissionRoles) => {
                return permissionRoles;
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

router.get(
    "/picker",
    handleErrorAsync(async function (req: Request<ParamsDictionary, any, any, ListQueryParams>, res) {
        const result = await new PermissionRoleService(req)
            .getPermissionRolePickerList(req.query.str, req.query.filter)
            .then((permissionRoles) => {
                return permissionRoles;
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

router.get(
    "/:id([0-9]{1,11})", // TODO: Move path pattern to wf_common
    handleErrorAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const permissionRoleService = new PermissionRoleService(req);
        const result = await permissionRoleService
            .getPermissionRole(Number(id))
            .then((permissionRole) => {
                return permissionRole;
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

router.post(
    "",
    handleErrorAsync(async (req: Request, res: Response) => {
        const permissionRoleData = req.body;
        const permissionRoleService = new PermissionRoleService(req);
        const result = await permissionRoleService

            .createPermissionRole(permissionRoleData)
            .then((permissionRole) => {
                return { status: "ok", result: permissionRole };
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

router.put(
    "",
    handleErrorAsync(async (req: Request, res: Response) => {
        const permissionRoleData = req.body;
        const permissionRoleService = new PermissionRoleService(req);
        const result = await permissionRoleService
            .updatePermissionRole(permissionRoleData)
            .then((permissionRole) => {
                return { status: "ok", result: permissionRole };
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

router.delete(
    "/:id([0-9]{1,11})", // TODO: Move path pattern to wf_common
    handleErrorAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const permissionRoleService = new PermissionRoleService(req);
        const result = await permissionRoleService
            .deletePermissionRole(Number(id))
            .then((permissionRole) => {
                return { status: "ok", result: permissionRole };
            })
            .catch((error) => {
                return { status: "error", error }; // TODO: Error case handler
            });
        res.json(result);
    })
);

export = router;
