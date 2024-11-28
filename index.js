const inquirer = require('inquirer').default;
const fs = require('fs');

const usersFilePath = './users.json';

// mostrar usuarios desde el archivo
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch {
    return [];
  }
};

const writeUsers = (users) => fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

const listUsers = async () => {
  const users = readUsers();
  if (!users.length) return console.log('No hay usuarios.');

  const { filter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'filter',
      message: '¿Qué usuarios deseas ver?',
      choices: ['Todos', 'Completos', 'Incompletos'],
    },
  ]);

  const filteredUsers = users.filter(u => 
    filter === 'Todos' ||
    (filter === 'Completos' && u.phone && u.address) ||
    (filter === 'Incompletos' && (!u.phone || !u.address))
  );

  console.log(filteredUsers.length ? filteredUsers.map(u => `${u.name} ${u.complete}`) : `No hay usuarios ${filter.toLowerCase()}.`);
};

// Crear un nuevo usuario
const createUser = async () => {
  const { name, email, phone, address } = await inquirer.prompt([
    { name: 'name', message: 'Nombre:' },
    { name: 'email', message: 'Correo electrónico:' },
    { name: 'phone', message: 'Teléfono:' },
    { name: 'address', message: 'Dirección:' },
  ]);

  const newUser = { id: Date.now(), name, email, phone, address, complete: phone && address };
  writeUsers([...readUsers(), newUser]);
  console.log('Usuario creado.');
};

const editUser = async () => {
    const users = readUsers();
    if (!users.length) return console.log('No hay usuarios.');
  
    const { name } = await inquirer.prompt([{ name: 'name', message: 'Nombre del usuario a editar:' }]);
  
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) return console.log('Usuario no encontrado.');

    const { newName, email, phone, address } = await inquirer.prompt([
      { name: 'newName', message: 'Nuevo nombre:', default: user.name },
      { name: 'email', message: 'Nuevo correo electrónico:', default: user.email },
      { name: 'phone', message: 'Nuevo teléfono:', default: user.phone },
      { name: 'address', message: 'Nueva dirección:', default: user.address },
    ]);
    // Actualizar los datos del usuario
    user.name = newName || user.name; 
    user.email = email || user.email; 
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.complete = phone && address; 
  
    // Guardar los cambios en el archivo
    writeUsers(users);
    console.log('Usuario actualizado.');
  };    
  // Eliminar usuario
  const deleteUser = async () => {
    const users = readUsers();
    if (!users.length) return console.log('No hay usuarios.');
    const { name } = await inquirer.prompt([{ name: 'name', message: 'Nombre del usuario a eliminar:' }]);
  
    const index = users.findIndex(u => u.name.toLowerCase() === name.toLowerCase()); // Comparación insensible a mayúsculas
    if (index === -1) return console.log('Usuario no encontrado.');
  
    // Eliminamos al usuario encontrado
    users.splice(index, 1);
    writeUsers(users);
    console.log('Usuario eliminado.');
  };
  

// Menú principal
const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Seleccione una opción:',
      choices: ['Crear usuario', 'Ver usuarios', 'Editar Usuario', 'Eliminar usuario', 'Salir'],
    },
  ]);
  switch (action) {
    case 'Crear usuario': await createUser(); break;
    case 'Ver usuarios': await listUsers(); break;
    case 'Editar Usuario': await editUser(); break;
    case 'Eliminar usuario': await deleteUser(); break;
    default: console.log('¡Adiós!'); return;
  }

  mainMenu(); 
};

// Iniciar la aplicación
mainMenu();