import { withAuth } from "next-auth/middleware";

// Secure the Nexus dashboard physically at the Edge network layer
export default withAuth({
  pages: {
    signIn: "/auth/command", // Redirect unverified traffic straight to the command terminal
  },
});

export const config = {
  matcher: [
    "/nexus/:path*", 
    "/nexus",
    "/dashboard/:path*",
    "/dashboard"
  ]
};
