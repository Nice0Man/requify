import React from 'react';
import {
  TextField,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Controller, Control, FieldError } from 'react-hook-form';

interface BaseFieldProps {
  name: string;
  control: Control<any>;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

export const FormTextField: React.FC<TextFieldProps> = ({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  error,
  type = 'text',
  multiline,
  rows,
  placeholder,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        label={label}
        type={type}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder}
        helperText={error?.message || helperText}
        error={!!error}
        required={required}
        disabled={disabled}
        fullWidth
        variant="outlined"
      />
    )}
  />
);

interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string | number; label: string }>;
  multiple?: boolean;
}

export const FormSelectField: React.FC<SelectFieldProps> = ({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  error,
  options,
  multiple = false,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControl fullWidth error={!!error} disabled={disabled}>
        <InputLabel required={required}>{label}</InputLabel>
        <Select
          {...field}
          label={label}
          multiple={multiple}
          value={field.value || (multiple ? [] : '')}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {(error?.message || helperText) && (
          <FormHelperText>{error?.message || helperText}</FormHelperText>
        )}
      </FormControl>
    )}
  />
);

interface CheckboxFieldProps extends BaseFieldProps {
  checkboxLabel?: string;
}

export const FormCheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  control,
  checkboxLabel,
  disabled,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value || false}
            disabled={disabled}
          />
        }
        label={checkboxLabel}
      />
    )}
  />
);

interface RadioFieldProps extends BaseFieldProps {
  options: Array<{ value: string | number; label: string }>;
  row?: boolean;
}

export const FormRadioField: React.FC<RadioFieldProps> = ({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  error,
  options,
  row = false,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControl error={!!error} disabled={disabled}>
        <InputLabel required={required}>{label}</InputLabel>
        <RadioGroup {...field} row={row}>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
        {(error?.message || helperText) && (
          <FormHelperText>{error?.message || helperText}</FormHelperText>
        )}
      </FormControl>
    )}
  />
);

interface AutocompleteFieldProps extends BaseFieldProps {
  options: Array<{ value: string | number; label: string }>;
  multiple?: boolean;
  freeSolo?: boolean;
}

export const FormAutocompleteField: React.FC<AutocompleteFieldProps> = ({
  name,
  control,
  label,
  helperText,
  required,
  disabled,
  error,
  options,
  multiple = false,
  freeSolo = false,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Autocomplete
        {...field}
        options={options}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.label
        }
        isOptionEqualToValue={(option, value) =>
          typeof option === 'string' ? option === value : option.value === value?.value
        }
        multiple={multiple}
        freeSolo={freeSolo}
        disabled={disabled}
        value={field.value || (multiple ? [] : null)}
        onChange={(_, value) => field.onChange(value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={typeof option === 'string' ? option : option.label}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={!!error}
            helperText={error?.message || helperText}
            required={required}
          />
        )}
      />
    )}
  />
); 