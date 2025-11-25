import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "./Snackbar";
import dayjs from "dayjs";
import { identifyAccountType } from "../services/accountType";

export const Context = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useMembers = () => {
  const context = useContext(Context);
  if (!context) throw new Error("useMembers debe ser usado con un ContextProvider");
  return context;
};

// eslint-disable-next-line react/prop-types
export const ContextProvider = ({ children }) => {
  const [gymInfo, setGymInfo] = useState({});
  const [shopInfo, setShopInfo] = useState({});
  const [membersList, setMembersList] = useState([]);
  const [loadingMembersList, setLoadingMembersList] = useState(false);
  const [trainersList, setTrainersList] = useState([]);
  const [adding, setAdding] = useState(false);
  const [backdrop, setBackdrop] = useState(false);
  const [navBarOptions, setNavBarOptions] = useState(false);
  const [needsUpdateClients, setNeedsUpdateClients] = useState(true);
  const [needsUpdateTrainer, setNeedsUpdateTrainer] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();
  const [productsList, setProductsList] = useState([]);
  const [needsUpdateProducts, setNeedsUpdateProducts] = useState(true);

  const handlerNeedUpdateClients = async (value) => {
    setNeedsUpdateClients(value);
  }
  const handlerFillMembersList = async (data) => {
    // Normalizar el campo `phone` para evitar pérdidas (asegurar string y valor por defecto)
    try {
      const normalized = (data || []).map(item => ({
        ...item,
        phone: item?.phone !== undefined && item?.phone !== null ? String(item.phone) : "",
      }));
      setMembersList(normalized.sort((a, b) => b.id - a.id));
    } catch (err) {
      setMembersList(data.sort((a, b) => b.id - a.id));
    }
  }



  // Unified getGymInfo function
  const getGymInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { data, error } = await supabase
        .from('info_general_gym')
        .select('*')
        .eq('owner_id', user.id)
        .single(); // Expecting a single row

      if (error) {
        console.error("Error fetching gym info:", error);
        showMessage("Error al cargar la información del gimnasio", "error");
        return null;
      }

      if (data) {
        setGymInfo(data); // Update state
        if (data.next_payment_date) {
          const today = new Date();
          const futureDate = new Date(data.next_payment_date);
          const timeDifference = futureDate - today;
          const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
          setDaysRemaining(daysDifference);
        }
      }
      return data; // Return data if needed by caller
    } catch (error) {
      console.error(error);
      showMessage("Ha ocurrido un error inesperado al obtener la información del gimnasio.", "error");
      return null;
    }
  };

  // Unified getShopInfo function
  const getShopInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const { data, error } = await supabase
        .from('info_shops')
        .select('*')
        .eq('owner_id', user.id)
        .single(); // Expecting a single row

      if (error) {
        console.error("Error fetching shop info:", error);
        showMessage("Error al cargar la información de la tienda", "error");
        return null;
      }

      if (data) {
        setShopInfo(data); // Update state
      }
      return data; // Return data if needed by caller
    } catch (error) {
      console.error(error);
      showMessage("Ha ocurrido un error inesperado al obtener la información de la tienda.", "error");
      return null;
    }
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { type, data } = await identifyAccountType(user.id);
        if (type === 'gym') {
          setGymInfo(data);
          if (data.next_payment_date) {
            const today = new Date();
            const futureDate = new Date(data.next_payment_date);
            const timeDifference = futureDate - today;
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
            setDaysRemaining(daysDifference);
          }
        } else if (type === 'shop') {
          setShopInfo(data);
        }
      }
    };
    fetchInitialData();
  }, []);


  const getMembers = async (value) => {
    setTimeout(async () => {
      if (needsUpdateClients || value) {
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
    }, 100)

  }

  const getDashboardData = () => {
    setTimeout(async () => {
      setBackdrop(true);
      const { data } = await supabase.auth.getUser();
      await supabase
        .from("members")
        .select("id,active, created_at, gender, gym_id, has_trainer, trainer_name, first_name, last_name,ci, pay_date,address")
        .eq("gym_id", data?.user?.id)
        .then(async (res, err) => {
          if (err) {
            setBackdrop(false);
            console.error("Error fetching data:", err);
            return;
          }
          if (res?.data?.length > 0) {
            await handlerFillMembersList(res.data);
          }
        })

      const res = await supabase.from("trainers").select().eq("gym_id", data?.user?.id);
      if (res?.data?.length > 0) {
        setTrainersList(res.data);
        setBackdrop(false)
      } else { setBackdrop(false); }

    }, 100);


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
    }, 100);

  }


  const createNewMember = async (memberData) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);

    // 👇 tomamos la fecha seleccionada por el usuario
    const fechaSeleccionada = dayjs(memberData.pay_date);

    // 👇 sumamos un mes exacto, respetando el día y el año
    const fechaFinal = fechaSeleccionada.add(1, "month");

    // 👇 formateamos
    const new_payment_date = fechaFinal.format("YYYY-MM-DD");

    let dataToSave = {
      ...memberData,
      pay_date: new_payment_date,
    };

    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newMembers, error: insertError } = await supabase.from("members").insert({
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
          gym_id: user?.id,
        }).select();

        setBackdrop(false);
        navigate("/clientes");

        if (insertError) {
          showMessage("Registro no guardado: " + insertError.message, "error");
          return;
        }

        if (newMembers && newMembers.length > 0) {
          const newMember = newMembers[0];
          const months = 1; // Primer pago es siempre de 1 mes
          const trainerIncluded = newMember.has_trainer;

          const monthlyPayment = gymInfo.monthly_payment || 0;
          const trainerCost = gymInfo.trainers_cost || 0;

          let totalAmount = monthlyPayment * months;
          if (trainerIncluded && newMember.trainer_name) {
            totalAmount += trainerCost * months;
          }

          const { error: historyError } = await supabase
            .from('payment_history_members')
            .insert({
              member_id: newMember.id,
              gym_id: user.id,
              quantity_paid: totalAmount,
              currency: gymInfo.monthly_currency || 'CUP',
              trainer_included: trainerIncluded,
              next_payment: new_payment_date
            });

          if (historyError) {
            showMessage("Cliente creado, pero falló el registro del pago inicial.", "warning");
            console.error("Payment history error:", historyError);
          } else {
            showMessage("Registro guardado satisfactoriamente", "success");
          }

          await getMembers(true);
        } else {
          showMessage("Registro no guardado.", "error");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setAdding(false);
      }
    }, 100);
  };
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
        showMessage("¡Nuevo entrenador resgistrado!", "success");
        getTrainers();
      } else {
        showMessage("¡Falló la creación del entrenador!", "error");
      }
    } catch (error) {
      console.error(error)
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
      showMessage("Registro eliminado satisfactoriamente", "success");
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
      showMessage("Registro eliminado satisfactoriamente", "success");
      getTrainers();
    } else throw new Error(error);
  };

  const updateClient = async (member, virifiedAcount) => {
    setBackdrop(true);
    setAdding(true);
    const { data } = await supabase.auth.getUser();
    let memberToSave = { ...member };

    if (virifiedAcount) {
      const fechaActual = dayjs().add(1, "month"); // si lo necesitas
      memberToSave.initial_gym_date = fechaActual.format("YYYY-MM-DD");
      memberToSave.verified_account = data?.user?.id;
    } else {
      memberToSave.gym_id = data?.user?.id;
    }

    setTimeout(async () => {
      try {
        await handlerNeedUpdateClients(true);
        const result = await supabase
          .from("members")
          .update(memberToSave)
          .eq("id", member?.id);

        setBackdrop(false);
        navigate("/clientes");

        if (result) {
          await getMembers(true);
          showMessage("Registro actualizado satisfactoriamente", "success");
        }
      } catch (error) {
        console.error(error);
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
        showMessage("Registro actualizado satisfactoriamente", "success");
        navigate('/entrenadores');
        getTrainers();
      } else {
        showMessage("A ocurrido un error actualizando la información", "error");
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
        showMessage("Registro actualizado satisfactoriamente")
        await getMembers(true);
      } else {
        showMessage("A ocurrido un error actualizando la información", "error");
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
        showMessage("Pago registrado satisfactoriamente", "success");
        await getMembers(true);
      } else {
        showMessage("A ocurrido un error actualizando el estado del pago", "error");
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
      setBackdrop(false);
      if (result) {
        showMessage("Reglas aplicadas satisfactoriamente a todos los clientes seleccionados", "success");
        await getMembers(true);
      } else {
        showMessage("Error aplicando las reglas", "error");
      }
    } catch (error) {
      console.error(error)
    }
    finally {
      setAdding(false);
    }
  };

  const importClients = async (clientsList) => {
    setBackdrop(true);
    setAdding(true);
    await handlerNeedUpdateClients(true);
    try {
      const result = await supabase.from('members').upsert(clientsList);
      setBackdrop(false);
      if (result) {
        showMessage("Lista de clientes importados satisfactoriamente", "success");
        await getMembers(true);
      } else {
        showMessage("Error importando clientes", "error");
      }
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false);
    }
  };

  const getProducts = async (forceUpdate = false) => {
    if (needsUpdateProducts || forceUpdate) {
      setBackdrop(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('gym_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProductsList(data || []);
        setNeedsUpdateProducts(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        showMessage("Error al cargar productos", "error");
      } finally {
        setBackdrop(false);
      }
    }
  };

  const createProduct = async (productData) => {
    setBackdrop(true);
    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await supabase.from("products").insert({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        currency: productData.currency,
        image_base64: productData.image_base64,
        product_code: productData.product_code,
        has_delivery: productData.has_delivery,
        has_pickup: productData.has_pickup,
        gym_id: user.id,
      });

      if (result.error) throw result.error;

      showMessage("Producto creado exitosamente", "success");
      setNeedsUpdateProducts(true);
      await getProducts(true);
      return { success: true };
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.code === '23505') {
        showMessage("Ya existe un producto con ese código", "error");
      } else {
        showMessage("Error al crear el producto", "error");
      }
      return { success: false, error };
    } finally {
      setBackdrop(false);
      setAdding(false);
    }
  };

  const updateProduct = async (productId, productData) => {
    setBackdrop(true);
    setAdding(true);
    try {
      const result = await supabase
        .from("products")
        .update({
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          currency: productData.currency,
          image_base64: productData.image_base64,
          product_code: productData.product_code,
          has_delivery: productData.has_delivery,
          has_pickup: productData.has_pickup,
        })
        .eq("id", productId);

      if (result.error) throw result.error;

      showMessage("Producto actualizado exitosamente", "success");
      setNeedsUpdateProducts(true);
      await getProducts(true);
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.code === '23505') {
        showMessage("Ya existe un producto con ese código", "error");
      } else {
        showMessage("Error al actualizar el producto", "error");
      }
      return { success: false, error };
    } finally {
      setBackdrop(false);
      setAdding(false);
    }
  };

  const deleteProduct = async (productId) => {
    setBackdrop(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("gym_id", user.id)
        .eq("id", productId);

      if (error) throw error;

      showMessage("Producto eliminado exitosamente", "success");
      setNeedsUpdateProducts(true);
      await getProducts(true);
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      showMessage("Error al eliminar el producto", "error");
      return { success: false, error };
    } finally {
      setBackdrop(false);
    }
  };

  const registerPayment = async (memberData, months, trainerIncluded) => {
    setBackdrop(true);
    setAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Calcular nueva fecha de pago sumando los meses
      const currentPayDate = dayjs(memberData.pay_date);
      const newPayDate = currentPayDate.add(months, 'month').format('YYYY-MM-DD');

      // Calcular el monto total basado en los precios del gimnasio
      const monthlyPayment = gymInfo.monthly_payment || 0;
      const trainerCost = gymInfo.trainers_cost || 0;

      let totalAmount = monthlyPayment * months;
      if (trainerIncluded && memberData.trainer_name) {
        totalAmount += trainerCost * months;
      }

      console.log(newPayDate, memberData.trainer_name, memberData.trainer_name !== null && memberData.trainer_name !== '')
      // Actualizar el miembro con la nueva fecha de pago y entrenador
      const { error: updateError } = await supabase
        .from('members')
        .update({
          pay_date: newPayDate,
          trainer_name: memberData.trainer_name,
          has_trainer: memberData.trainer_name !== null && memberData.trainer_name !== ''
        })
        .eq('id', memberData.id)
        .eq('gym_id', user.id);

      if (updateError) throw updateError;

      // Registrar en el historial de pagos (con el esquema ajustado)
      const { error: historyError } = await supabase
        .from('payment_history_members')
        .insert({
          member_id: memberData.id, // bigint de members.id
          gym_id: user.id, // uuid del gimnasio
          quantity_paid: totalAmount,
          currency: gymInfo.monthly_currency || 'CUP',
          trainer_included: trainerIncluded,
          next_payment: newPayDate
        });

      if (historyError) throw historyError;

      showMessage("Pago registrado exitosamente", "success");
      await getMembers(true);

    } catch (error) {
      console.error('Error registering payment:', error);
      showMessage("Error al registrar el pago", "error");
    } finally {
      setBackdrop(false);
      setAdding(false);
    }
  };

  return <Context.Provider
    value={{
      gymInfo,
      shopInfo,
      membersList,
      loadingMembersList,
      trainersList,
      adding,
      backdrop,
      navBarOptions,
      daysRemaining,
      productsList,
      getMembers,
      getDashboardData,
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
      importClients,
      setNavBarOptions,
      getGymInfo,
      getProducts,
      createProduct,
      updateProduct,
      deleteProduct,
      setShopInfo,
      getShopInfo,
      registerPayment,
      setGymInfo,
    }}>
    {children}
  </Context.Provider>
};