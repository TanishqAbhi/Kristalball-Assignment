export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
};

// Enforces base scoping for BASE_COMMANDER and LOGISTICS_OFFICER when a baseId is targeted
export const enforceBaseScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  const targetBaseId =
    req.body?.baseId ??
    req.body?.base_id ??
    req.body?.sourceBaseId ??
    req.query?.baseId;

  if (targetBaseId && Number(targetBaseId) !== Number(req.user.base_id)) {
    return res.status(403).json({
      error: 'Forbidden: operation restricted to your assigned base',
    });
  }

  next();
};
