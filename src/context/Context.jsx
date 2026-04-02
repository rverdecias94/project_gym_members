import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { identifyAccountType } from "../services/accountType";
import { toast } from "sonner";

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

  // Adaptador de compatibilidad para showMessage hacia sonner
  const showMessage = (msg, type = "default") => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else if (type === "warning") toast.warning(msg);
    else if (type === "info") toast.info(msg);
    else toast(msg);
  };

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



  // Wrapper for getUser to use sessionStorage
  const getAuthUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      sessionStorage.setItem("auth_user", JSON.stringify(data.user));
    } else {
      sessionStorage.removeItem("auth_user");
    }
    return { data, error };
  };

  // Helper function to check payment status and update products
  const checkPaymentAndDisableProducts = async (userData, userId) => {
    if (userData?.next_payment_date) {
      const nextPayment = dayjs(userData.next_payment_date);
      const today = dayjs();

      if (today.isAfter(nextPayment, 'day')) {
        console.log("Payment overdue for user:", userId);
        try {
          const { error } = await supabase
            .from('products')
            .update({ enable: false })
            .eq('user_store_id', userId);

          if (error) throw error;
          console.log("Products disabled successfully");
        } catch (err) {
          console.error("Error disabling products:", err);
        }
      }
    }
  };

  // Unified getGymInfo function
  const getGymInfo = async (forceUpdate = false) => {
    try {
      const { data: { user } } = await getAuthUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      if (!forceUpdate) {
        try {
          const cachedGymInfo = sessionStorage.getItem("gym_info");
          if (cachedGymInfo) {
            const parsed = JSON.parse(cachedGymInfo);
            setGymInfo(parsed);
            if (parsed.next_payment_date) {
              const today = new Date();
              const futureDate = new Date(parsed.next_payment_date);
              const timeDifference = futureDate - today;
              const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
              setDaysRemaining(daysDifference);
            }
            await checkPaymentAndDisableProducts(parsed, user.id);
            return parsed;
          }
        } catch (e) {
          console.error("Error reading gym_info from session", e);
        }
      }

      const { data, error } = await supabase
        .from('info_general_gym')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle(); // Expecting a single row or none

      if (error) {
        console.error("Error fetching gym info:", error);
        showMessage("Error al cargar la información del gimnasio", "error");
        return null;
      }

      if (data) {
        sessionStorage.setItem("gym_info", JSON.stringify(data));
        setGymInfo(data); // Update state
        if (data.next_payment_date) {
          const today = new Date();
          const futureDate = new Date(data.next_payment_date);
          const timeDifference = futureDate - today;
          const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
          setDaysRemaining(daysDifference);
        }
        // Check overdue payment
        await checkPaymentAndDisableProducts(data, user.id);
      }
      return data; // Return data if needed by caller
    } catch (error) {
      console.error(error);
      showMessage("Ha ocurrido un error inesperado al obtener la información del gimnasio.", "error");
      return null;
    }
  };

  // Unified getShopInfo function
  const getShopInfo = async (forceUpdate = false) => {
    try {
      const { data: { user } } = await getAuthUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      if (!forceUpdate) {
        try {
          const cachedShopInfo = sessionStorage.getItem("shop_info");
          if (cachedShopInfo) {
            const parsed = JSON.parse(cachedShopInfo);
            setShopInfo(parsed);
            await checkPaymentAndDisableProducts(parsed, user.id);
            return parsed;
          }
        } catch (e) {
          console.error("Error reading shop_info from session", e);
        }
      }

      const { data, error } = await supabase
        .from('info_shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle(); // Expecting a single row or none

      if (error) {
        console.error("Error fetching shop info:", error);
        showMessage("Error al cargar la información de la tienda", "error");
        return null;
      }

      if (data) {
        sessionStorage.setItem("shop_info", JSON.stringify(data));
        setShopInfo(data); // Update state
        console.log(data)
        // Check overdue payment
        await checkPaymentAndDisableProducts(data, user.id);
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
      const { data: { user } } = await getAuthUser();
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
          await checkPaymentAndDisableProducts(data, user.id);

          // Pre-cargar los entrenadores para que estén disponibles en toda la app
          const res = await supabase.from("trainers").select().eq("gym_id", user.id);
          if (res?.data) {
            setTrainersList(res.data);
            setNeedsUpdateTrainer(false);
          }
        } else if (type === 'shop') {
          setShopInfo(data);
          await checkPaymentAndDisableProducts(data, user.id);
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
        const { data } = await getAuthUser();
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
      const { data } = await getAuthUser();
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
      if (res?.data) {
        setTrainersList(res.data);
        setNeedsUpdateTrainer(false);
        setBackdrop(false)
      } else { setBackdrop(false); }

    }, 100);


  }

  const getTrainers = async (force = false) => {
    setTimeout(async () => {
      if (needsUpdateTrainer || force) {
        setBackdrop(true);
        const { data } = await getAuthUser();
        const res = await supabase.from("trainers").select().eq("gym_id", data?.user?.id);
        if (res?.data) {
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
        const { data: { user } } = await getAuthUser();
        const gymId = gymInfo?.owner_id || user?.id;

        if (!gymId) {
          showMessage("Error de autenticación. Por favor, inicie sesión nuevamente.", "error");
          setAdding(false);
          setBackdrop(false);
          return;
        }

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
          gym_id: gymId,
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
              gym_id: gymId,
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
      const { data } = await getAuthUser();
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
        getTrainers(true);
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
    try {
      const { data } = await getAuthUser();
      
      // Delete payment history first to satisfy foreign key constraint
      const { error: historyError } = await supabase.from("payment_history_members")
        .delete()
        .eq("member_id", id);
        
      if (historyError) throw historyError;

      const { error } = await supabase.from("members")
        .delete()
        .eq("gym_id", data?.user?.id)
        .eq("id", id);
        
      if (error) throw error;
      
      showMessage("Registro eliminado satisfactoriamente", "success");
      await getMembers(true);
    } catch (error) {
      showMessage("Error al eliminar el registro", "error");
      console.error(error);
    } finally {
      setBackdrop(false);
    }
  };

  const deleteTrainer = async (id) => {
    setBackdrop(true);
    const { data } = await getAuthUser();
    const { error } = await supabase.from("trainers")
      .delete()
      .eq("gym_id", data?.user?.id)
      .eq("id", id);
    setBackdrop(false);
    if (!error) {
      showMessage("Registro eliminado satisfactoriamente", "success");
      getTrainers(true);
    } else throw new Error(error);
  };

  const updateClient = async (member, virifiedAcount) => {
    setBackdrop(true);
    setAdding(true);
    const { data } = await getAuthUser();
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
        getTrainers(true);
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
        const { data: { user } } = await getAuthUser();
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
      const { data: { user } } = await getAuthUser();
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
      const { data: { user } } = await getAuthUser();
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
      const { data: { user } } = await getAuthUser();
      const gymId = gymInfo?.owner_id || user?.id;

      if (!gymId) {
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
        .eq('gym_id', gymId);

      if (updateError) throw updateError;

      // Registrar en el historial de pagos (con el esquema ajustado)
      const { error: historyError } = await supabase
        .from('payment_history_members')
        .insert({
          member_id: memberData.id, // bigint de members.id
          gym_id: gymId, // uuid del gimnasio
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
      getAuthUser,
    }}>
    {children}
  </Context.Provider>
};