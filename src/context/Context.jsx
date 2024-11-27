import { createContext, useContext, useState } from "react";
import { supabase } from "../supabase/client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
  const [backdrop, setBackdrop] = useState(false);
  const [navBarOptions, setNavBarOptions] = useState(false);
  const [needsUpdateClients, setNeedsUpdateClients] = useState(true);
  const [needsUpdateTrainer, setNeedsUpdateTrainer] = useState(true);
  const navigate = useNavigate();


  const handlerNeedUpdateClients = async (value) => {
    setNeedsUpdateClients(value);
  }
  const handlerFillMembersList = async (data) => {
    setMembersList(data.sort((a, b) => b.id - a.id));
  }

  const getMembers = async () => {
    setTimeout(async () => {
      console.log(needsUpdateClients)
      if (needsUpdateClients) {
        setLoadingMembersList(true);
        setBackdrop(true);
        const { data } = await supabase.auth.getUser();
        await supabase
          .from("members")
          .select()
          .eq("gym_id", data?.user?.id)
          .then(async (res, err) => {
            setLoadingMembersList(false);
            await handlerNeedUpdateClients(false);
            if (err) {
              setBackdrop(false);
              console.error("Error fetching data:", err);
              return;
            }
            if (res?.data?.length > 0) {
              await handlerFillMembersList(res.data);
              setBackdrop(false);
            }
          })
      }
    }, 1000)

  }

  const getTrainers = async () => {

    setTimeout(async () => {
      if (needsUpdateTrainer) {
        setBackdrop(true);
        const { data } = await supabase.auth.getUser();
        const res = await supabase.from("trainers").select().eq("gym_id", data?.user?.id);
        if (res?.data?.length > 0) {
          setTrainersList(res.data);
          setNeedsUpdateTrainer(false)
          setBackdrop(false);
        } else { setBackdrop(false); }
      }
    }, 1000);

  }

  const createNewMember = async (memberData) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    const fechaActual = new Date();
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    if (fechaActual.getMonth() === 0) {
      fechaActual.setFullYear(fechaActual.getFullYear() + 1);
    }

    let dataToSave = { ...memberData }
    dataToSave.pay_date = fechaActual;

    setTimeout(async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const result = await supabase.from("members").insert({
          first_name: dataToSave.first_name,
          last_name: dataToSave.last_name,
          ci: dataToSave.ci,
          address: dataToSave.address,
          phone: dataToSave.phone,
          gender: dataToSave.gender,
          has_trainer: dataToSave.has_trainer,
          trainer_name: dataToSave.trainer_name,
          image_profile: dataToSave.image_profile,
          pay_date: dataToSave.pay_date,
          gym_id: data?.user?.id,
        });
        setBackdrop(false);
        navigate('/clientes');
        if (result) {
          toast.success("Registro guardado satisfactoriamente")
          await getMembers(true);
        } else {
          toast.error("Registro no guardado")
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAdding(false);
      }
    }, 2000);
  }

  const createNewTrainer = async (trainerData) => {
    setBackdrop(true);
    setAdding(true);

    let dataToSave = { ...trainerData }
    try {
      const { data } = await supabase.auth.getUser();
      const result = await supabase.from("trainers").insert({
        name: dataToSave.name,
        last_name: dataToSave.last_name,
        ci: dataToSave.ci,
        image_profile: dataToSave.image_profile,
        gym_id: data?.user?.id,
      });

      setBackdrop(false);
      navigate('/entrenadores');
      if (result) {
        toast.success("¡Nuevo entrenador resgistrado!")
        getTrainers();
      } else {
        toast.error("¡Falló la creación del entrenador!")
      }
    } catch (error) {
      toast.error(error)
    } finally {
      setAdding(false);
    }
  }

  const deleteMember = async (id) => {
    setBackdrop(true);
    await handlerNeedUpdateClients(true);
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("members")
      .delete()
      .eq("gym_id", data?.user?.id)
      .eq("id", id);
    setBackdrop(false);
    if (!error) {
      toast.success("Registro eliminado satisfactoriamente")
      await getMembers(true);
    } else throw new Error(error);


  };

  const deleteTrainer = async (id) => {
    setBackdrop(true);
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("trainers")
      .delete()
      .eq("gym_id", data?.user?.id)
      .eq("id", id);
    setBackdrop(false);
    if (!error) {
      toast.success("Registro eliminado satisfactoriamente")
      getTrainers();
    } else throw new Error(error);
  };

  const updateClient = async (member) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    setTimeout(async () => {
      try {
        const result = await supabase.from("members").update(member).eq("id", member?.id);
        setBackdrop(false);
        navigate('/clientes');
        if (result) {
          await getMembers(true);
          toast.success("Registro actualizado satisfactoriamente")
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAdding(false);
      }
    }, 2000);
  };

  const updateTrainer = async (trainer) => {
    setBackdrop(true);
    setAdding(true);
    try {
      const result = await supabase.from("trainers").update(trainer).eq("id", trainer?.id);
      setBackdrop(false);
      if (result) {
        toast.success("Registro actualizado satisfactoriamente")
        navigate('/entrenadores');
        getTrainers();
      } else {
        toast.error("A ocurrido un error actualizando la información")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  const changedStatusToActive = async (clientsList) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    try {
      const result = await supabase.from('members').upsert(clientsList);
      setBackdrop(false);
      if (result) {
        toast.success("Registro actualizado satisfactoriamente")
        await getMembers(true);
      } else {
        toast.error("A ocurrido un error actualizando la información")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  const makePayment = async (clientsList) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    try {
      const result = await supabase.from('members').upsert(clientsList);
      setBackdrop(false);
      if (result) {
        toast.success("Pago registrado satisfactoriamente");
        await getMembers(true);
      } else {
        toast.error("A ocurrido un error actualizando el estado del pago");
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  const applyRuleToRows = async (clientsList) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    try {
      const result = await supabase.from('members').upsert(clientsList);
      setBackdrop(true);
      if (result) {
        toast.success("Reglas aplicadas satisfactoriamente a todos los clientes seleccionados");
        await getMembers(true);
      } else {
        toast.error("Error aplicando las reglas");
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
      backdrop,
      navBarOptions,
      getMembers,
      getTrainers,
      createNewMember,
      createNewTrainer,
      updateClient,
      updateTrainer,
      deleteMember,
      deleteTrainer,
      changedStatusToActive,
      makePayment,
      setBackdrop,
      applyRuleToRows,
      setNavBarOptions
    }}>
    {children}
  </Context.Provider>
};