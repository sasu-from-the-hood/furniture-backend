import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
} from 'react-admin';

// List component for orders
export const OrderList = (props) => (
  <List {...props} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <TextField source="id" />
      <ReferenceField source="userId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="status" />
      <DateField source="createdAt" />
      <NumberField source="total" options={{ style: 'currency', currency: 'ETB' }} />
    </Datagrid>
  </List>
);
