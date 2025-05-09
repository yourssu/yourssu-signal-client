import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/page";
import ProfileRegisterPage from "@/pages/profile/register/page";
import ProfileVerificationPage from "@/pages/verify/page";
import ProfileListPage from "@/pages/profile/page";
import ContactViewPage from "@/pages/profile/contact/page";
import NotFound from "@/pages/NotFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SavedProfilesPage from "@/pages/profile/saved/page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "verify",
        element: <ProfileVerificationPage />,
      },
      {
        path: "profile",
        element: <ProfileListPage />,
      },
      {
        path: "profile/register",
        element: <ProfileRegisterPage />,
      },
      {
        path: "profile/contact",
        element: <ContactViewPage />,
      },
      {
        path: "profile/saved",
        element: <SavedProfilesPage />,
      },
    ],
  },
]);

const App: React.FC = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
