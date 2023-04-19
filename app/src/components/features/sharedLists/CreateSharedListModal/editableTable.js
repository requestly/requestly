import React, { useContext, useState, useEffect, useRef } from "react";
import { Table, Input, Form } from "antd";
import Logger from "lib/logger";
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      Logger.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const EditableTable = (props) => {
  const handleSave = (row) => {
    const newData = props.dataSource.map((ele) => Object.assign({}, ele));
    const index = newData.findIndex((item) => {
      return row.key === item.key;
    });
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    props.setDataSource(newData);
  };

  const updatedColumns = props.columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: (record) => handleSave(record),
      }),
    };
  });
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  return (
    <div>
      <Table
        components={components}
        dataSource={props.dataSource}
        columns={updatedColumns}
        pagination={false}
        showHeader={false}
      />
    </div>
  );
};

export default EditableTable;
