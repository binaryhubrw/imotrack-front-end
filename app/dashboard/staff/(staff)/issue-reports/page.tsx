mutationFn: async (vehicleData: unknown) => {
  console.log("Sending vehicle data:", vehicleData);
  const { data } = await api.post('/fleetmanager/vehicles', vehicleData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}, 