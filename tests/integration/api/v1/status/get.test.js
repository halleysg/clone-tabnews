test("GET to /api/v1/status should return 200", async () => {
  const res = await fetch("http://localhost:3000/api/v1/status");
  expect(res.status).toBe(200);

  const resBody = await res.json();

  expect(resBody.dependencies.database.version).toEqual("16.0");
  expect(resBody.dependencies.database.max_connections).toEqual(100);
  expect(resBody.dependencies.database.open_connections).toEqual(1);

  expect(new Date(resBody.updated_at).toISOString()).toEqual(
    resBody.updated_at,
  );
});
