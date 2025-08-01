
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MembersList from './MembersList';
import Trainers from './TrainersList';
import Dashboard from './Dashboard';
import { useMembers } from '../context/Context';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function Menu() {
  const { valueTab, setValueTab } = useMembers();

  const handleChange = (event, newValue) => {
    setValueTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={valueTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Panel" {...a11yProps(0)} />
          <Tab label="Clientes" {...a11yProps(1)} />
          <Tab label="Entrenadores" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={valueTab} index={0}>
        <Dashboard />
      </CustomTabPanel>
      <CustomTabPanel value={valueTab} index={1}>
        <MembersList />
      </CustomTabPanel>
      <CustomTabPanel value={valueTab} index={2}>
        <Trainers />
      </CustomTabPanel>
    </Box>
  );
}