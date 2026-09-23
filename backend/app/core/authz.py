from app.models.role import RoleName

# Roles that can bypass ownership checks on cricket-core resources
# (teams/tournaments/matches) - a broader set than the SUPER_ADMIN/ADMIN pair
# used for global actions like role assignment, since MATCH_ADMIN's whole
# purpose per the RBAC design is managing matches it didn't create.
CRICKET_ADMIN_ROLES = {
    RoleName.SUPER_ADMIN.value,
    RoleName.ADMIN.value,
    RoleName.MATCH_ADMIN.value,
}


def is_cricket_admin(user) -> bool:
    return bool(set(user.role_names) & CRICKET_ADMIN_ROLES)


def is_owner_or_admin(user, owner_id) -> bool:
    return user.id == owner_id or is_cricket_admin(user)
