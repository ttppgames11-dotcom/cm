package com.connectmaratha.api.common.security;

import java.util.Locale;
import java.util.Set;

/** Who counts as an admin or as helpdesk staff (backend/utils/websiteTables.js). */
public final class Roles {

    private static final Set<String> ADMIN = Set.of("admin", "superadmin", "ceo");
    private static final Set<String> STAFF = Set.of(
        "admin", "superadmin", "ceo",
        "staff", "center_manager", "helpdesk", "pradesh_admin", "division_admin", "division_head",
        "district_admin", "district_head", "taluka_admin", "taluka_head", "branch_admin",
        "chapter_president", "finance");

    private Roles() {}

    public static boolean isAdmin(CurrentUser user) {
        return user != null && ADMIN.contains(role(user));
    }

    public static boolean isStaff(CurrentUser user) {
        return user != null && STAFF.contains(role(user));
    }

    private static String role(CurrentUser user) {
        return user.role() == null ? "" : user.role().toLowerCase(Locale.ROOT);
    }
}
