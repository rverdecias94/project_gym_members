/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useMembers } from '../context/Context';
import { TableTrainersList } from './TableTrainersList';


function Trainers() {
  const { trainersList, getTrainers } = useMembers();

  useEffect(() => {
    getTrainers();
  }, [])

  return (
    <TableTrainersList trainersList={trainersList} />
  )
}

export default Trainers