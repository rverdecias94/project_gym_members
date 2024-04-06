import { Button } from "@mui/material"
import { useEffect } from "react";

//import MembersForm from './MembersForm';
import { Link } from "react-router-dom";
import { useMembers } from "../context/Context";

export default function Home() {

  const { getTrainers } = useMembers();
  useEffect(() => {
    getTrainers();
  }, [])

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <Link to="/new_member" style={{ width: "50%", color: "white", textDecoration: "none" }}>
        <Button variant="contained" style={{ width: "100%", background: "#356dac" }}>
          Miembro
        </Button>
      </Link>
      <Link to="/new_trainer" style={{ width: "50%", color: "white", textDecoration: "none" }}>
        <Button variant="contained" style={{ width: "100%", background: "#356dac" }}>
          Entrenador
        </Button>
      </Link>
    </div>
  )
}