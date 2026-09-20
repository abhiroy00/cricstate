from types import SimpleNamespace

import pytest

from app.api.deps import require_roles
from app.core.exceptions import ForbiddenError


def _fake_user(roles: list[str]) -> SimpleNamespace:
    return SimpleNamespace(role_names=roles)


async def test_require_roles_allows_matching_role():
    checker = require_roles("ADMIN", "SUPER_ADMIN")
    user = _fake_user(["ADMIN"])

    result = await checker(current_user=user)

    assert result is user


async def test_require_roles_denies_missing_role():
    checker = require_roles("ADMIN", "SUPER_ADMIN")
    user = _fake_user(["USER"])

    with pytest.raises(ForbiddenError):
        await checker(current_user=user)
