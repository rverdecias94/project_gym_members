import { NavLink } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export const NavButton = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      style={() => ({
        textDecoration: 'none',
      })}
    >
      {({ isActive }) => (
        <button
          className='btn_nav'
          style={{
            border: "none",
            background: "transparent",
            borderBottom: isActive ? '4px solid #e49c10' : 'none',
            color: isActive ? '#e49c10' : "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            padding: "5px 10px",
            width: "fit-content",
            margin: "0 10px"
          }}
        >
          {icon}
          <span>{text}</span>
        </button>
      )
      }
    </NavLink >
  );
};