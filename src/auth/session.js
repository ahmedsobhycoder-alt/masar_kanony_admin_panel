const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const getAdminSession = () => {
  const token = localStorage.getItem("token");
  const expiresAt = Number(localStorage.getItem("tokenExpiresAt"));
  const userJson = localStorage.getItem("adminUser");

  if (!token || !expiresAt || expiresAt <= Date.now() || !userJson) {
    clearAdminSession();
    return null;
  }

  try {
    const user = JSON.parse(userJson);
    if (user.role !== "admin") {
      clearAdminSession();
      return null;
    }
    return { token, expiresAt, user };
  } catch {
    clearAdminSession();
    return null;
  }
};

export const saveAdminSession = (user, token) => {
  const session = {
    token,
    expiresAt: Date.now() + SESSION_DURATION,
    user: { id: user.id || user._id, name: user.name, email: user.email, role: user.role },
  };

  localStorage.setItem("token", session.token);
  localStorage.setItem("tokenExpiresAt", String(session.expiresAt));
  localStorage.setItem("adminUser", JSON.stringify(session.user));
  return session;
};

export const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiresAt");
  localStorage.removeItem("adminUser");
};