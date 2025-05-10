import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';
import InputValidation from '../../utils/InputValidation';

// List component for categories
export const CategoryList = (props) => (
  <List {...props} sort={{ field: 'name', order: 'ASC' }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="description" />
      {/* <BooleanField source="isActive" /> */}
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Edit component for categories
export const CategoryEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="name" validate={required()} parse={(value) => InputValidation(value, "letter")} />
      <TextInput source="description" multiline />
      {/* <BooleanInput source="isActive" /> */}
    </SimpleForm>
  </Edit>
);

// Create component for categories
export const CategoryCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" validate={required()}  parse={(value) => InputValidation(value, "letter")}/>
      <TextInput source="description" multiline />
      {/* <BooleanInput source="isActive" defaultValue={true} /> */}
    </SimpleForm>
  </Create>
);
