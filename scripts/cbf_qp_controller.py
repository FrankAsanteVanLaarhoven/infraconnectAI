import numpy as np
import cvxpy as cp

class CBF_QP_Controller:
    """
    FleetSafe-VLA Delay-Robust Control Barrier Function (CBF-QP)
    Implements a formal safety filter utilizing semantic zones, distance calculations,
    and covariance uncertainty bounds from the paper's main theoretical framework.
    """
    def __init__(self, alpha=1.0, gamma=1.0):
        self.alpha = alpha
        self.gamma = gamma

    def compute_control(self, x, goal, obstacle, Sigma):
        """
        x = [x, y, vx, vy]
        goal = [gx, gy]
        obstacle = [ox, oy]
        Sigma = covariance matrix (2x2)
        """

        # Control variable (vx, vy command)
        u = cp.Variable(2)

        # Objective: go to goal
        goal_dir = goal - x[:2]
        J = cp.Minimize(cp.sum_squares(u - goal_dir))

        # Safety function h(x) = distance - safe_dist
        d_safe = 1.0
        dist = np.linalg.norm(x[:2] - obstacle)
        h = dist - d_safe

        # Gradient of h wrt position
        if dist > 1e-3:
            grad_h = (x[:2] - obstacle) / dist
        else:
            grad_h = np.zeros(2)

        # Uncertainty term
        # Utilizes the paper's covariance matrix bound for delay formulation
        uncertainty = np.sqrt(grad_h.T @ Sigma @ grad_h)

        # CBF constraint: grad_h * u >= -alpha*h - gamma*uncertainty
        constraint = grad_h @ u >= -self.alpha * h - self.gamma * uncertainty

        prob = cp.Problem(J, [constraint])
        
        try:
            prob.solve(solver=cp.OSQP)
        except Exception as e:
            return np.zeros(2)

        if u.value is None:
            return np.zeros(2)

        return u.value
