import React, { FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, ButtonType, JSONInput } from './common/ui';
import { CompilationResult } from 'types';

interface IProps {
  handleLoad: (data: any) => void;
}
type FormCompiled = {
  compiledJSON: CompilationResult;
};

export const OutputJSONForm: FC<IProps> = ({ handleLoad }: IProps) => {
  const { control, register: compiledReg, handleSubmit: handleCompiledResultSubmit, getValues, setValue } = useForm<
    FormCompiled
  >({ shouldUnregister: false });
  const handleSubmit = () => {
    const compiledJSON: CompilationResult = getValues('compiledJSON');
    handleLoad({ compiled: JSON.stringify(compiledJSON) });
  };
  return (
    <form onSubmit={handleCompiledResultSubmit(handleSubmit)} className="form_align">
      <div className="json_input_container" style={{ marginTop: '10px' }}>
        <Controller
          name="compiledJSON"
          ref={compiledReg}
          render={() => (
            <JSONInput
              value={getValues('compiledJSON')}
              onChange={(input: CompilationResult) => setValue('compiledJSON', input)}
            />
          )}
          control={control}
        />
      </div>
      <Button buttonType={ButtonType.Input}>Load JSON</Button>
    </form>
  );
};
