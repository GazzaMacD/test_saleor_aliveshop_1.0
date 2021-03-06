import * as React from 'react';
import styles from './CheckoutAddressForm.module.scss';
import {
  shippingFormTemplate,
  billingFormTemplate,
} from './CheckoutAddressFormTemplates';
import {
  makeCheckoutCreateMutation,
  constructLines,
} from './CheckoutAddressFormUtils';
import { useRouter } from 'next/router';
import { useAsync } from '@/utils/custom-hooks';
import { client } from '@/utils/api/api-client';
import { Loading } from '@/components/elements/Loading';
import { Redirect } from '@/components/elements/Redirect';

/* Input Component */
const Input = ({
  formId,
  type,
  name,
  label,
  submittedValue,
  wasSubmitted,
  required,
  options,
  validators,
}: {
  formId: string;
  type: string;
  name: string;
  label: string;
  submittedValue: string;
  wasSubmitted: boolean;
  required: boolean;
  options?: any;
  validators?: any;
}): JSX.Element => {
  const [value, setValue] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const { errors } = validators({ value: value, errors: [] });
  const displayErrorMessage = (wasSubmitted || touched) && errors.length > 0;

  switch (type) {
    case 'text':
      return (
        <div key={name} className={styles.formGroup}>
          <label className={styles.label} htmlFor={`${formId}-${name}`}>
            {label}
          </label>
          <input
            className={styles.input}
            id={`${formId}-${name}`}
            name={name}
            type="text"
            onChange={(event) => setValue(event.currentTarget.value)}
            onBlur={() => setTouched(true)}
            required={required}
            defaultValue={submittedValue}
          />
          {displayErrorMessage ? (
            <ul>
              {errors.map((error: string, index: number) => {
                return (
                  <li
                    key={error}
                    role="alert"
                    id={`${index}-${name}-error`}
                    className="error-message"
                  >
                    {error}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      );
    case 'select':
      return (
        <div key={name} className={styles.formGroup}>
          <label className={styles.label} htmlFor={`${formId}-${name}`}>
            {label}
          </label>
          <select
            className={styles.input}
            id={`${formId}-${name}`}
            name={name}
            onChange={(event) => setValue(event.currentTarget.value)}
            onBlur={() => setTouched(true)}
            required={required}
            defaultValue={submittedValue}
          >
            {options.map((option: any) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
          {displayErrorMessage ? (
            <ul>
              {errors.map((error: string, index: number) => {
                return (
                  <li
                    key={error}
                    role="alert"
                    id={`${index}-${name}-error`}
                    className="error-message"
                  >
                    {error}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      );
    default:
      throw new Error('invalid type provided to Input component');
  }
};

const CheckoutAddressForm: React.FC = ({
  apiEndpoint,
  shoppingCart,
  appCheckoutCreate,
  serverFieldErrors,
  run,
  data,
  setSubmittedFormValues,
  submittedFormValues,
  checkoutProcesss,
  hasFormErrors,
}): JSX.Element => {
  const baseErrorsState = { hasErrors: false, errorMsg: '' };
  const [billingSameAsShipping, setBillingSameAsShipping] =
    React.useState(false);
  const [formErrors, setFormErrors] = React.useState(baseErrorsState);
  const shippingForm = React.useRef(undefined);
  const billingForm = React.useRef(undefined);

  function makeLinesArray(shoppingCart) {
    const lines = [];
    shoppingCart.forEach((item) => {
      const itemObj = {};
      itemObj.quantity = item.quantity;
      itemObj.variantId = item.variantId;
      lines.push(itemObj);
    });
    return lines;
  }

  function mapBackFieldErrorsToLabels(errorsArray, template) {
    let errorMessage = 'Sorry your form has errors in the following fields. ';
    errorsArray.forEach((error, i) => {
      template.fields.forEach((field) => {
        if (error.field === field.name) {
          const msg = `${i + 1}. ${field.label}  `;
          errorMessage += msg;
        }
      });
    });
    errorMessage += '.Please check and resubmit.';
    return errorMessage;
  }

  function handleContinueToShipping(event: any) {
    const shippingFormData = new FormData(shippingForm.current);
    const shippingFieldValues = Object.fromEntries(shippingFormData.entries());
    const customerEmail = shippingFieldValues.email;
    const submittedFormValuesCopy = JSON.parse(
      JSON.stringify(submittedFormValues)
    );
    submittedFormValuesCopy.shippingFormValues = shippingFieldValues;

    let billingFieldValues: any;
    if (billingSameAsShipping) {
      billingFieldValues = { ...shippingFieldValues };
      delete billingFieldValues['email'];
    } else {
      const billingFormData = new FormData(billingForm.current);
      billingFieldValues = Object.fromEntries(billingFormData.entries());
    }
    submittedFormValuesCopy.billingFormValues = billingFieldValues;
    setSubmittedFormValues(submittedFormValuesCopy);
    const lines = makeLinesArray(shoppingCart);

    const preCheckoutValues = {
      email: customerEmail,
      lines: lines,
      shippingAddress: shippingFieldValues,
      billingAddress: billingFieldValues,
    };
    const linesString = constructLines(preCheckoutValues.lines);
    const gqlMutation = makeCheckoutCreateMutation(
      linesString,
      preCheckoutValues
    );
    const clientConfig = {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        query: gqlMutation,
      }),
    }; // clientConfig
    // reset errors ob
    setFormErrors(baseErrorsState);

    run(client(apiEndpoint, clientConfig));
  } // handleContinueToShipping

  function handleSameAsShipping() {
    setBillingSameAsShipping(!billingSameAsShipping);
  }

  /*

          const errorsStr = mapBackFieldErrorsToLabels(
            data.data.checkoutCreate.checkoutErrors,
            shippingFormTemplate
          );
          setFormErrors({
            hasErrors: true,
            errorMsg: errorsStr,
          });
          */
  React.useEffect(() => {
    if (!hasFormErrors) {
      return;
    }
    const errorsStr = mapBackFieldErrorsToLabels(
      data.data.checkoutCreate.checkoutErrors,
      shippingFormTemplate
    );
    setFormErrors({
      hasErrors: true,
      errorMsg: errorsStr,
    });
  }, [hasFormErrors]);

  return (
    <div>
      {formErrors.hasErrors && <p>{formErrors.errorMsg}</p>}
      <h2>{shippingFormTemplate.formTitle}</h2>
      <form className={styles.form} noValidate ref={shippingForm}>
        {shippingFormTemplate.fields.map((field) => {
          return (
            <Input
              key={field.name}
              formId={shippingFormTemplate.formId}
              type={field.type}
              name={field.name}
              submittedValue={
                submittedFormValues.shippingFormValues
                  ? submittedFormValues.shippingFormValues[field.name]
                  : checkoutProcesss.shippingSubmitted
                  ? checkoutProcesss.shippingFormData.shippingFormValues[
                      field.name
                    ]
                  : ''
              }
              label={field.label}
              validators={field.validators}
              options={field.options}
            />
          );
        })}
      </form>
      <hr />
      <h2>{billingFormTemplate.formTitle}</h2>
      <div>
        <input
          onChange={handleSameAsShipping}
          type="checkbox"
          checked={billingSameAsShipping}
          id="billing-same-as-shipping"
        />
        <label htmlFor="billing-same-as-shipping">
          Billing Address Same as Shipping?
        </label>
      </div>
      <div>
        {billingSameAsShipping ? null : (
          <form className={styles.form} noValidate ref={billingForm}>
            {billingFormTemplate.fields.map((field) => {
              return (
                <Input
                  key={field.name}
                  formId={billingFormTemplate.formId}
                  type={field.type}
                  name={field.name}
                  submittedValue={
                    submittedFormValues.billingFormValues
                      ? submittedFormValues.billingFormValues[field.name]
                      : checkoutProcesss.shippingSubmitted
                      ? checkoutProcesss.shippingFormData.billingFormValues[
                          field.name
                        ]
                      : ''
                  }
                  label={field.label}
                  validators={field.validators}
                  options={field.options}
                />
              );
            })}
          </form>
        )}
      </div>
      <button onClick={handleContinueToShipping}>Continue to Shipping</button>
    </div>
  );
}; // CheckoutAddressForm

export const CheckoutAddressFormWrapper: React.FC = ({
  apiEndpoint,
  shoppingCart,
  appCheckoutCreate,
  checkoutProcess,
}): JSX.Element => {
  const { status, data, error, run } = useAsync();
  const [wasSubmittedSuccess, setWasSubmittedSuccess] = React.useState(false);
  const [submittedFormValues, setSubmittedFormValues] = React.useState({
    shippingFormValues: null,
    billingFormValues: null,
  });
  let returnJSX: JSX.Element = <></>;

  if (wasSubmittedSuccess) {
    returnJSX = <Redirect to="/checkout/shipping" />;
  } else {
    switch (status) {
      case 'idle':
        // Check for submitted on checkoutProcess (need shippingSubmitted: false, shippingAddressData: {})
        returnJSX = (
          <CheckoutAddressForm
            apiEndpoint={apiEndpoint}
            shoppingCart={shoppingCart}
            appCheckoutCreate={appCheckoutCreate}
            setSubmittedFormValues={setSubmittedFormValues}
            submittedFormValues={submittedFormValues}
            checkoutProcesss={checkoutProcess}
            hasFormErrors={false}
            data={data}
            run={run}
          />
        );
        break;
      case 'pending':
        returnJSX = <Loading />;
        break;
      case 'rejected':
        console.error(error);
        returnJSX = (
          <p>
            Sorry, there seems to be a network error. Please check your
            connection and refresh the page.
          </p>
        );
        break;
      case 'resolved':
        if (data.errors) {
          console.error(
            `\nError Details: ` +
              data.errors?.map((e) => e.message).join('\n') ?? 'unknown'
          );
          returnJSX = (
            <p>Sorry, there is an error! Please refresh and try again</p>
          );
        } else {
          //no data.errors
          if (data.data.checkoutCreate.checkoutErrors.length > 0) {
            //  return form with hasFormErrors set to true
            returnJSX = (
              <CheckoutAddressForm
                apiEndpoint={apiEndpoint}
                shoppingCart={shoppingCart}
                appCheckoutCreate={appCheckoutCreate}
                setSubmittedFormValues={setSubmittedFormValues}
                submittedFormValues={submittedFormValues}
                checkoutProcesss={checkoutProcess}
                hasFormErrors={true}
                data={data}
                run={run}
              />
            );
          } else {
            appCheckoutCreate(
              data.data.checkoutCreate.checkout,
              submittedFormValues
            );
            setWasSubmittedSuccess(true);
          } // checkoutErrors.length > 0 else
        } //data.errors else
        break;
      default:
        returnJSX = <p>Sorry, we are not sure what happened</p>;
        break;
    } // end switch
  }
  return returnJSX;
}; // CheckoutAddress Form Wrapper
