import type {FormikErrors, FormikHelpers} from 'formik';
import {Field, Formik} from 'formik';
import type {FC} from 'react';
import {useRef} from 'react';
import {Image, View} from 'react-native';
import {createStyles} from './styles';
import type {FormValues, LoginProps} from './types';
import validationSchema from './validationSchema';
import {Button, Container, LoadingOverlay, Title} from '../../components';
import {useThemedStyles} from '../../hooks';
import {ErrorFeedback, PasswordField, TextField} from '../../forms/fields';
import loginLogo from '../../assets/images/logo.png';
import {useSessionStore} from '../../state/session/slice.ts';
import {useLogin} from '../../state/session/actions.tsx';
import {users} from '../../constans/users.ts';

const initialValues: FormValues = {username: '', password: ''};

const Login: FC<LoginProps> = () => {
  const [styles] = useThemedStyles(createStyles);
  const {status} = useSessionStore();
  const {login} = useLogin();
  const handleSubmit = async (
    values: FormValues,
    actions: FormikHelpers<FormValues>,
  ) => {
    await login(values.username, values.password);
    actions.resetForm({values});
    actions.setStatus({isSubmitted: true});
  };

  const handleAutoComplete = async (
    setFieldValue: (
      field: string,
      value: any,
      shouldValidate?: boolean | undefined,
    ) => Promise<void | FormikErrors<FormValues>>,
    email: string,
    password: string | number,
  ) => {
    await setFieldValue('username', email, false);
    await setFieldValue('password', `${password}`, false);
  };

  const usernameRef = useRef();
  const passwordRef = useRef();

  return (
    <Container accessibilityLabel="view-login-container">
      {status.isFetching && <LoadingOverlay />}
      <View style={styles.image}>
        <Image source={loginLogo} style={styles.logo} />
      </View>
      <Title style={styles.title}>Inicio de sessión</Title>
      <Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validateOnMount
        validationSchema={validationSchema}>
        {({submitForm, dirty, status: state, setFieldValue}) => (
          <View style={styles.content}>
            <View style={styles.content}>
              <Field
                accessibilityLabel="txt-login-username"
                component={TextField}
                name="username"
                config={{
                  placeholder: 'Ingrese su email',
                  label: 'Email',
                  returnKeyType: 'next',
                  keyboardType: 'email-address',
                }}
                innerRef={usernameRef}
                nextInnerRef={passwordRef}
              />
              <Field
                accessibilityLabel="txt-login-password"
                component={PasswordField}
                name="password"
                config={{
                  placeholder: 'Ingrese contraseña',
                  label: 'Contraseña',
                }}
                innerRef={passwordRef}
              />
            </View>
            {!dirty && state?.isSubmitted && status.errorMessage && (
              <ErrorFeedback config={{label: status.errorMessage}} />
            )}
            <View style={styles.buttonContainer}>
              <Button
                onPress={submitForm}
                title="Ingresar"
                accessibilityLabel="btn-login-submit"
                buttonStyle={styles.button}
              />
            </View>
            <View style={styles.buttonsContainer}>
              {users.map(user => (
                <Button
                  key={user.id}
                  title={user.rol}
                  onPress={() =>
                    handleAutoComplete(setFieldValue, user.email, user.password)
                  }
                  buttonStyle={styles.buttonAutoComplete}
                />
              ))}
            </View>
          </View>
        )}
      </Formik>
    </Container>
  );
};

export default Login;
