import App from "./App.jsx";
import Home from "./Home.jsx";
import Calendar from "./Calendar.jsx";
import Profile from "./Profile.jsx";
import Admin from "./Admin.jsx";
import About from "./pages/About.jsx";
import Membership from "./pages/Membership.jsx";
import Events from "./pages/Events.jsx";
import Contact from "./pages/Contact.jsx";
import Career from "./pages/Career.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
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
      {
        path: "o-nas",
        element: <About />,
      },
      {
        path: "czlonkostwo",
        element: <Membership />,
      },
      {
        path: "wydarzenia",
        element: <Events />,
      },
      {
        path: "kontakt",
        element: <Contact />,
      },
      {
        path: "kariera",
        element: <Career />,
      },
      {
        path: "regulamin",
        element: <Terms />,
      },
      {
        path: "polityka-prywatnosci",
        element: <Privacy />,
      },
    ],
  },
];

export default routes;
