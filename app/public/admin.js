const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();

// ¡OJO! Sirve archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.urlencoded({ extended: true }));

// Configuración de conexión a MySQL
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "vete1234@321",
    database: "veterinariaDB",
    port: 3306
};

// Ruta de inicio: renderiza el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Guardar Mascota
app.post('/guardar_mascota', async (req, res) => {
    const data = req.body;
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        const sql = `INSERT INTO Cartilla (idmascota, Dueño, nombreM, raza, numVacunas, peso, cantComida, Citasprev, proxcita)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await conn.execute(sql, [
            data.idmascota, data.Dueño, data.nombreM, data.raza,
            data.numVacunas, data.peso, data.cantComida, false, null
        ]);
        res.send("Mascota guardada correctamente");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar mascota");
    } finally {
        if (conn) await conn.end();
    }
});

// Agendar cita
app.post('/agendar_cita', async (req, res) => {
    const { idmascota, proxcita } = req.body;
    let conn;
    try {
        conn = await mysql.createConnection(dbConfig);
        const updateSql = `UPDATE Cartilla SET Citasprev = ?, proxcita = ? WHERE idmascota = ?`;
        await conn.execute(updateSql, [true, proxcita, idmascota]);

        const selectSql = `SELECT proxcita FROM Cartilla WHERE idmascota = ?`;
        const [rows] = await conn.execute(selectSql, [idmascota]);
        if (rows.length > 0 && rows[0].proxcita) {
            res.send(`Próxima cita agendada: ${rows[0].proxcita}`);
        } else {
            res.send("No hay cita agendada");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al agendar cita");
    } finally {
        if (conn) await conn.end();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});