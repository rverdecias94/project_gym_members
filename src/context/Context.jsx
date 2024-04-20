import { createContext, useContext, useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";

export const Context = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useMembers = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useMembers debe ser usado con un ContextProvider");
  return context;
};

// eslint-disable-next-line react/prop-types
export const ContextProvider = ({ children }) => {
  const [membersList, setMembersList] = useState([]);
  const [loadingMembersList, setLoadingMembersList] = useState(false);
  const [trainersList, setTrainersList] = useState([]);
  const [adding, setAdding] = useState(false);

  const getMembers = async () => {
    setLoadingMembersList(true);
    const res = await supabase.from("members").select()
    setLoadingMembersList(false);
    if (res?.data?.length > 0) {
      setMembersList(res.data);
    }
  }
  const getTrainers = async () => {
    const res = await supabase.from("trainers").select();
    console.log(res);
    if (res?.data?.length > 0) {
      setTrainersList(res.data);
    }
  }

  const createNewMember = async (memberData) => {
    setAdding(true);
    const fechaActual = new Date();
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    // Verificar si el mes resultante es enero para ajustar el año
    if (fechaActual.getMonth() === 0) {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }

    // Formatear la fecha en formato día, mes, año
    const dia = fechaActual.getDate();
    const mes = fechaActual.getMonth() + 1;
    const año = fechaActual.getFullYear();

    let dataToSave = { ...memberData }
    // Actualizar la clave pay_date en el objeto
    dataToSave.pay_date = `${año}-${mes}-${dia}`;
    console.log(dataToSave);
    try {
      const result = await supabase.from("members").insert({
        first_name: dataToSave.first_name,
        last_name: dataToSave.last_name,
        ci: dataToSave.ci,
        address: dataToSave.address,
        gender: dataToSave.gender,
        has_trainer: dataToSave.has_trainer,
        trainer_name: dataToSave.trainer_name,
        image_profile: dataToSave.image_profile,
        pay_date: dataToSave.pay_date,
      });
      console.log(result)
      if (result) {
        toast.success("Registro guardado satisfactoriamente")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  }

  const createNewTrainer = async (trainerData) => {
    setAdding(true);

    let dataToSave = { ...trainerData }
    console.log(dataToSave);
    try {
      const result = await supabase.from("trainers").insert({
        name: dataToSave.name,
        last_name: dataToSave.last_name,
        ci: dataToSave.ci,
        image_profile: dataToSave.image_profile,
      });
      console.log(result)
      if (result) {
        toast.success("!Nuevo entrenador resgistrado!")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  }

  const deleteMember = async (id) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      toast.success("Registro eliminado satisfactoriamente")
      getMembers();
    } else throw new Error(error);

  };

  const deleteTrainer = async (id) => {
    const { error } = await supabase.from("trainers").delete().eq("id", id);
    if (!error) {
      toast.success("Registro eliminado satisfactoriamente")
      getTrainers();
    } else throw new Error(error);

  };


  const updateMember = async (member) => {
    setAdding(true);
    try {
      const result = await supabase.from("members").update(member).eq("id", member?.id);
      if (result) {
        toast.success("Registro actualizado satisfactoriamente")
        getMembers();
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  const updateTrainer = async (trainer) => {
    setAdding(true);
    try {
      const result = await supabase.from("trainers").update(trainer).eq("id", trainer?.id);
      if (result) {
        toast.success("Registro actualizado satisfactoriamente")
        getTrainers();
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };


  const changedStatusToActive = async (userList) => {
    setAdding(true);
    try {
      const result = await supabase.from('members').upsert(userList);
      if (result) {
        toast.success("Registro actualizado satisfactoriamente")
        getMembers();
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  return <Context.Provider
    value={{
      membersList,
      loadingMembersList,
      trainersList,
      adding,
      getMembers,
      getTrainers,
      createNewMember,
      createNewTrainer,
      updateMember,
      updateTrainer,
      deleteMember,
      deleteTrainer,
      changedStatusToActive
    }}>
    {children}
  </Context.Provider>
};