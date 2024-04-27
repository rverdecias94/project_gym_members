import { Button } from "@mui/material"
import { Link } from "react-router-dom";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
export default function Home() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <Link to="/new_member" style={{ width: "50%", color: "white", textDecoration: "none" }}>
        <Button variant="contained" style={{ width: "100%", display: "flex", justifyContent: "space-evenly", background: "#356dac" }}>
          <PersonAddIcon /> Miembro
        </Button>
      </Link>
      <Link to="/new_trainer" style={{ width: "50%", color: "white", textDecoration: "none" }}>
        <Button variant="contained" style={{ width: "100%", display: "flex", justifyContent: "space-evenly", background: "#356dac" }}>
          <PersonAddIcon /> Entrenador
        </Button>
      </Link>
    </div>
  )
}