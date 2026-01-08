import React, { useState, useEffect } from 'react';

interface MaskedDateInputProps {
    value: string; // ISO format (yyyy-mm-dd)
    onChange: (value: string) => void; // Returns ISO format
    className?: string;
}

const MaskedDateInput: React.FC<MaskedDateInputProps> = ({ value, onChange, className }) => {
    const [displayValue, setDisplayValue] = useState('');

    // Sincroniza o valor prop (ISO) com o valor de exibição (dd/mm/aaaa)
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-');
            if (y && m && d) {
                setDisplayValue(`${d}/${m}/${y}`);
                return;
            }
        }
        setDisplayValue('');
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número

        // Aplica a máscara dd/mm/aaaa
        if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
        if (v.length > 5) v = v.substring(0, 5) + '/' + v.substring(5, 9);

        setDisplayValue(v);

        // Se estiver completo (10 caracteres incluindo barras), converte para ISO
        if (v.length === 10) {
            const [d, m, y] = v.split('/');
            // Validação básica de ano para evitar o erro relatado (42026)
            const yearNum = parseInt(y);
            if (yearNum >= 1900 && yearNum <= 2100) {
                onChange(`${y}-${m}-${d}`);
            }
        } else if (v.length === 0) {
            onChange('');
        }
    };

    return (
        <input
            type="text"
            autoComplete="off"
            placeholder="dd/mm/aaaa"
            value={displayValue}
            onChange={handleInputChange}
            maxLength={10}
            className={className}
            style={{
                borderColor: 'rgb(193, 193, 193)',
                paddingLeft: '6.864px',
                borderRadius: '5px',
                color: 'rgb(73, 80, 87)',
                outline: 'none',
                boxShadow: 'rgba(33, 50, 66, 0.25) 0px 0px 0px 1px', // Suavizado para não carregar demais
                fontSize: '16px',
                fontStyle: 'normal',
                margin: '0px',
                fontFamily: "'Open Sans', 'Helvetica Neue', sans-serif",
                lineHeight: '24px',
                boxSizing: 'border-box',
                padding: '6.864px',
                fontWeight: '400',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                appearance: 'none',
                display: 'block',
                width: '100%',
                height: '38px',
                border: '2px solid rgb(193, 193, 193)',
                backgroundColor: 'rgb(255, 255, 255)'
            }}
        />
    );
};

export default MaskedDateInput;
