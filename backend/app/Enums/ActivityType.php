<?php

namespace App\Enums;

enum ActivityType: string
{
    case CREATED = 'created';
    case UPDATED = 'updated';
    case DELETED = 'deleted';
    case RESTORED = 'restored';
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case REGISTERED = 'registered';
    case EMAIL_VERIFIED = 'email_verified';
    case PASSWORD_RESET = 'password_reset';
    case PASSWORD_CHANGED = 'password_changed';
    case ROLE_ASSIGNED = 'role_assigned';
    case INVITED = 'invited';
    case SUSPENDED = 'suspended';
    case UNSUSPENDED = 'unsuspended';
    case COLLEGE_ASSIGNED = 'college_assigned';
    case CHECK_IN = 'check_in';
    case CANCELLED = 'cancelled';
    case REQUEST = 'request';
    case PUBLISHED = 'published';
    case UNPUBLISHED = 'unpublished';
    case ARCHIVED = 'archived';
    case UNARCHIVED = 'unarchived';
    case MEDIA_UPLOADED = 'media_uploaded';
    case MEDIA_DELETED = 'media_deleted';
    case SPONSOR_ADDED = 'sponsor_added';
    case SPONSOR_REMOVED = 'sponsor_removed';
    case CERTIFICATE_ISSUED = 'certificate_issued';
    case CERTIFICATE_REVOKED = 'certificate_revoked';
    case OTP_SENT = 'otp_sent';
    case TICKET_ISSUED = 'ticket_issued';
    case PAYMENT_RECORDED = 'payment_recorded';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
