
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router/Router";


export function App() {
  return (
    <RouterProvider
      router={router}
    />
  );
}

export default App;
