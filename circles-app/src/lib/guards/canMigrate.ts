import type {AvatarRow} from "@circles-sdk/data";

export function canMigrate(avatar: AvatarRow | undefined): boolean {
    if (!avatar) {
        return false;
    }

    // Pure v1 avatars can migrate
    if (avatar.version === 1 && avatar.type === "human") {
        return true;
    }

    // v2 avatars can migrate if they have a v1 token and it's not stopped
    if (avatar.hasV1 && avatar.version === 2 && avatar.type === "human") {
        return !avatar.v1Stopped ?? false;
    }

    return false;
}