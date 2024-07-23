const { Pool } = require("pg");

//Se conecta al a base de datos
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "SinSQL5",
  database: "skatepark",
  port: 5432,
});

// Se añade nuevo skater
const nuevoSkater = async (skater) => {
  const values = Object.values(skater)
  const result = await pool.query(
    `INSERT INTO skaters  ( email  ,  nombre  ,  password  , anos_experiencia , especialidad  , foto  , estado ) values ($1,$2, $3, $4 ,$5, $6, 'f') RETURNING *`
    , values);
  return result.rows[0];
}

// Se actuliza skater
const actualizarSkater = async (skater) => {
  const values = Object.values(skater)
  const result = await pool.query(
    `UPDATE skaters SET  nombre = $1, password = $2 , anos_experiencia = $3 , especialidad = $4   RETURNING *`
    , values);
  return result.rows[0];
}

// Se obtiene la lista de skaters
const obtenerSkaters = async () => {
  const result = await pool.query(`SELECT * FROM skaters`);
  return result.rows;
}

// Se obtiene la info de un skater
const obtenerSkater = async (email, password) => {
  const result = await pool.query(
    `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`
  );

  return result.rows[0];
}

// Se edita el estado de un skater
const editEstadoSkater = async (id, estado) => {
  const result = await pool.query(
    `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
  );
  const skater = result.rows[0];
  return skater;
}

// Se elimina un skater
const eliminarSkater = async (id) => {
  const result = await pool.query(
    `DELETE FROM skaters WHERE id = ${id} RETURNING *`
  );
  const skater = result.rows[0];
  return skater;
}

// Se importan las funciones para su uso
module.exports = {
  nuevoSkater,
  obtenerSkaters,
  obtenerSkater,
  editEstadoSkater,
  actualizarSkater,
  eliminarSkater
};
