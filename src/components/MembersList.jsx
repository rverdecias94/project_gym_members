import { useEffect, useState } from 'react';
import { useMembers } from '../context/Context';
import { TableMembersList } from './TableMembersList';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { MembersInactive } from './MembersInactive';
import { TablePendingPay } from './TablePendingPay';
import { TablePagoRetardado } from './TablePagoRetardado';

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
        <Box sx={{ p: 1 }}>
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
  const [membersPendingPayment, setMembersPendingPayment] = useState([]);
  const [membersPaymentDelayed, setMembersPaymentDelayed] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getMembers();
  }, [])

  function getStartOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }
  function getEndOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() + (day === 0 ? 0 : 7 - day); // adjust when day is sunday
    return new Date(date.setDate(diff));
  }

  function isInCurrentWeek(dateString) {
    const today = new Date();
    const startDate = getStartOfWeek(today);
    const endDate = getEndOfWeek(today);
    const dateToCheck = new Date(dateString);

    return dateToCheck >= startDate && dateToCheck <= endDate;
  }
  function filterObjectsByCurrentWeek(objects) {
    return objects.filter(obj => isInCurrentWeek(new Date(obj.pay_date)));
  }

  function latePayment(dateString) {
    const today = new Date();
    const dateToCheck = new Date(dateString);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateToCheckDate = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate());
    return dateToCheckDate < todayDate;
  }

  function filterObjectsLatePayment(objects) {
    return objects.filter(obj => latePayment(new Date(obj.pay_date)));
  }

  useEffect(() => {
    const paymentInCurrentWeek = filterObjectsByCurrentWeek(membersList);
    const delayedPayment = filterObjectsLatePayment(membersList);

    const filteredPaymentInCurrentWeek = paymentInCurrentWeek.filter(member => {
      return !delayedPayment.some(p => p.id === member.id);
    });

    setMembersPaymentDelayed(delayedPayment);
    setMembersPendingPayment(filteredPaymentInCurrentWeek);

    const membersStatusObj = membersList?.reduce((acc, obj) => {
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
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="Activos" {...a11yProps(0)} />
          <Tab label="Por pagar" {...a11yProps(1)} />
          <Tab label="Pago atrasado" {...a11yProps(2)} />
          <Tab label="Inactivos" {...a11yProps(3)} />
          <Tab label="Tienda" {...a11yProps(4)} />
        </Tabs>
        {/* </ScrollableTabs> */}
      </Box>
      <CustomTabPanel value={value} index={0}>
        <TableMembersList membersList={membersStatus?.active} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TablePendingPay membersPendingPayment={membersPendingPayment} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <TablePagoRetardado membersPaymentDelayed={membersPaymentDelayed} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <MembersInactive membersList={membersStatus?.inactive} />
      </CustomTabPanel>
    </Box >
  )
}

export default MembersList