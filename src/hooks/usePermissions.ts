import { useEffect, useState } from "react";
import { getCurrentUserPermissions } from "../api";
import PERMISSION from "../enums/permission";

export default function usePermissions(path: string): {
  permissions: PERMISSION[];
  checkPermission: (permission: PERMISSION) => boolean;
  hasAdminPermission: boolean;
  hasWritePermission: boolean;
} {
  const [permissions, setPermissions] = useState<PERMISSION[]>([]);

  useEffect(() => {
    getCurrentUserPermissions({
      path,
    })
      .then((data) => {
        if (!Array.isArray(data)) {
          setPermissions([]);
          return;
        }
        setPermissions(data);
      })
      .catch((error) => {
        console.error(error);
        setPermissions([]);
      });
  }, [path]);

  function checkPermission(permission: PERMISSION) {
    return permissions.includes(permission);
  }

  const hasAdminPermission = checkPermission(PERMISSION.ADMIN);
  const hasWritePermission =
    hasAdminPermission || checkPermission(PERMISSION.WRITE);

  return {
    permissions,
    checkPermission,
    hasAdminPermission,
    hasWritePermission,
  };
}
