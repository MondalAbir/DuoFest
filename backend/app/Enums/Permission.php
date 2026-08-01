<?php

namespace App\Enums;

/**
 * Central permission catalogue. Permissions are grouped by resource and are
 * assigned to roles in RolePermissionSeeder.
 */
enum Permission: string
{
    // Colleges
    case COLLEGE_VIEW_ANY = 'college.view_any';
    case COLLEGE_VIEW = 'college.view';
    case COLLEGE_CREATE = 'college.create';
    case COLLEGE_UPDATE = 'college.update';
    case COLLEGE_DELETE = 'college.delete';

    // Events
    case EVENT_VIEW_ANY = 'event.view_any';
    case EVENT_VIEW = 'event.view';
    case EVENT_CREATE = 'event.create';
    case EVENT_UPDATE = 'event.update';
    case EVENT_DELETE = 'event.delete';
    case EVENT_PUBLISH = 'event.publish';
    case EVENT_ARCHIVE = 'event.archive';
    case EVENT_MEDIA = 'event.media';
    case EVENT_SPONSOR = 'event.sponsor';
    case EVENT_CERTIFICATE = 'event.certificate';

    // Registrations
    case REGISTRATION_VIEW_ANY = 'registration.view_any';
    case REGISTRATION_VIEW = 'registration.view';
    case REGISTRATION_CREATE = 'registration.create';
    case REGISTRATION_UPDATE = 'registration.update';
    case REGISTRATION_CANCEL = 'registration.cancel';
    case REGISTRATION_CHECK_IN = 'registration.check_in';

    // Volunteers
    case VOLUNTEER_VIEW_ANY = 'volunteer.view_any';
    case VOLUNTEER_CREATE = 'volunteer.create';
    case VOLUNTEER_UPDATE = 'volunteer.update';
    case VOLUNTEER_DELETE = 'volunteer.delete';
    case VOLUNTEER_SCAN = 'volunteer.scan';

    // Users
    case USER_VIEW_ANY = 'user.view_any';
    case USER_CREATE = 'user.create';
    case USER_UPDATE = 'user.update';
    case USER_ASSIGN_ROLE = 'user.assign_role';
    case USER_BLOCK = 'user.block';

    // Activity logs
    case ACTIVITY_LOG_VIEW_ANY = 'activity_log.view_any';

    // Admin
    case ADMIN_ACCESS = 'admin.access';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $permission) => $permission->value, self::cases());
    }
}
