import passport from "passport";
import googleStrategy from "./googleStrategy";
import localStrategy from "./localStrategy";
import userSerialize from "./userSerialize";

googleStrategy(passport);
localStrategy(passport);
userSerialize(passport);

export default passport;
