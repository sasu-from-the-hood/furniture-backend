import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  PasswordInput,
  SaveButton,
  Toolbar,
  FunctionField,
} from 'react-admin';

import InputValidation from '../../utils/InputValidation';

// Custom toolbar with fixed position
const CustomToolbar = props => (
  <Toolbar
    {...props}
    style={{
      position: 'sticky',
      bottom: 0,
      width: '100%',
      backgroundColor: 'white',
      zIndex: 2,
      boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
      padding: '16px',
    }}
  >
    <SaveButton />
  </Toolbar>
);

// Function to get role name from roleId
const getRoleName = (roleId) => {
  const roleMap = {
    1: 'Super Admin',
    2: 'Product Manager',
    3: 'Sales Admin',
    null: 'Regular User',
  };

  return roleMap[roleId] || 'Unknown Role';
};

// List component for users
export const UserList = (props) => (
  <List {...props} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <TextField source="name" />
      <EmailField source="email" />
      <FunctionField label="Role" render={record => getRoleName(record.roleId)} />
      <TextField source="phone" />
      <BooleanField source="isActive" />
      {/* <DateField source="createdAt" /> */}
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Edit component for users
export const UserEdit = (props) => (
  <Edit {...props}>
    <div style={{ height: '600px', overflow: 'scroll', padding: '16px', border: '1px solid #eee' }}>
      <SimpleForm
        toolbar={<CustomToolbar />}
        style={{
          marginBottom: '60px' // Space for the toolbar
        }}
      >
        {/* Required fields */}
        <TextInput source="name" validate={required()} parse={(value) => InputValidation(value, "letter")} />
        <TextInput source="email" validate={required()} type="email" />
        <TextInput source="phone" parse={(value) => InputValidation(value, "phone")} />
        <TextInput source="address" multiline />

        {/* Role selection */}
        <SelectInput
          source="roleId"
          label="Role"
          validate={required()}
          choices={[
            { id: 1, name: 'Super Admin' },
            { id: 2, name: 'Product Manager' },
            { id: 3, name: 'Sales Admin' },
            { id: null, name: 'Regular User' }
          ]}
        />
      </SimpleForm>
    </div>
  </Edit>
);

// Create component for users
export const UserCreate = (props) => (
  <Create {...props} mutationOptions={{ onSuccess: () => { window.location.href = '#/users'; } }}>
    <div style={{ height: '600px', overflow: 'scroll', padding: '34px', border: '1px solid #eee' }}>
      <SimpleForm
        toolbar={<CustomToolbar />}
        style={{
          marginBottom: '60px' // Space for the toolbar
        }}
      >
        {/* Required fields */}
        <TextInput source="name" validate={required()} parse={(value) => InputValidation(value, "letter")} />
        <TextInput source="email" validate={required()} type="email" />
        <PasswordInput source="password" validate={required()} />
        <TextInput source="phone" parse={(value) => InputValidation(value, "phone")} />
        <TextInput source="address" multiline />

        {/* Role selection */}
        <SelectInput
          source="roleId"
          label="Role"
          validate={required()}
          choices={[
            { id: 1, name: 'Super Admin' },
            { id: 2, name: 'Product Manager' },
            { id: 3, name: 'Sales Admin' },
            { id: null, name: 'Regular User' }
          ]}
        />
      </SimpleForm>
    </div>
  </Create>
);
