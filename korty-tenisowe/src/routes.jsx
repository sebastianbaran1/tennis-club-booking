import App from "./App.jsx";
import Home from "./Home.jsx";
import Calendar from "./Calendar.jsx";
import Profile from "./Profile.jsx";
import Admin from "./Admin.jsx";

const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "kalendarz",
        element: <Calendar />,
      },
      {
        path: "profil",
        element: <Profile />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
    ],
  },
];

export default routes;
