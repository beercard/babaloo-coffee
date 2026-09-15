import type { Access, FieldAccess } from 'payload';

export type Role = 'admin' | 'editor';

type UserLike = { role?: Role } | null | undefined;

export const isAdmin: Access = ({ req }) => (req.user as UserLike)?.role === 'admin';

export const isEditorOrAdmin: Access = ({ req }) => {
  const role = (req.user as UserLike)?.role;
  return role === 'admin' || role === 'editor';
};

export const isAdminField: FieldAccess = ({ req }) => (req.user as UserLike)?.role === 'admin';

/** Published content is public (the static site builds from it); everything else needs a login. */
export const publicRead: Access = () => true;

/** Admins can do anything; editors can create/update but not delete. */
export const editorContent = {
  read: publicRead,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isAdmin,
};

/** Same as `editorContent` but editors may also delete (menu items, gallery images…). */
export const editorContentDeletable = {
  read: publicRead,
  create: isEditorOrAdmin,
  update: isEditorOrAdmin,
  delete: isEditorOrAdmin,
};
