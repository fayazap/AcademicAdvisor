import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Route = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Route