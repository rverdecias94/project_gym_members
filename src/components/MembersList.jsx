import { useEffect } from 'react';
import { useMembers } from '../context/Context';
import { TableMembersList } from './TableMembersList';


function MembersList() {
  const { membersList, getMembers } = useMembers();

  useEffect(() => {
    getMembers();
  }, [])

  return (
    <TableMembersList membersList={membersList} />
  )
}

export default MembersList