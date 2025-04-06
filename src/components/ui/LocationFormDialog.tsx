            {/* Background Music Autocomplete - with explicit renderInput function */}
            <Autocomplete<string | null>
              options={audioFiles}
              getOptionLabel={(option: string | null) => option || ''}
              value={formData.backgroundMusic || null}
              onChange={(_event: React.ChangeEvent<{}> | null, selectedOption: string | null) => {
                onChange('backgroundMusic', selectedOption || '');
              }}
              isOptionEqualToValue={(option: string | null, value: string | null) => option === value}
              renderInput={(params: any) => (
                <TextField 
                  {...params}
                  label="Background Music"
                  placeholder="Select background music" 
                  fullWidth
                  // Explicitly pass the current value to help debugging
                  name="bgm-autocomplete-input"
                />
              )}
            /> 