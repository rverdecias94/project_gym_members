import { useEffect, useState } from 'react';
import { useMembers } from '../context/Context';
import { TableMembersList } from './TableMembersList';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { MembersInactive } from './MembersInactive';

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

function MembersList() {
  const { membersList, getMembers } = useMembers();
  const [value, setValue] = useState(0);
  const [membersStatus, setMembersStatus] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getMembers();
  }, [])


  useEffect(() => {
    const membersStatusObj = membersList.reduce((acc, obj) => {
      if (obj.active) {
        acc.active.push(obj);
      } else {
        acc.inactive.push(obj);
      }
      return acc;
    }, { active: [], inactive: [] });
    setMembersStatus(membersStatusObj);
  }, [membersList])

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Activos" {...a11yProps(0)} />
          <Tab label="Inactivos" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <TableMembersList membersList={membersStatus?.active} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <MembersInactive membersList={membersStatus?.inactive} />
      </CustomTabPanel>
    </Box>
  )
}

export default MembersList