import React, { createContext, useContext, useState } from 'react';

const TransferContext = createContext();

export function TransferProvider({ children }) {
    const [transfers, setTransfers] = useState([]);

    const updateProgress = (fileName, progress, mode) => {
        setTransfers((prev) => {
            const existing = prev.find((t) => t.fileName === fileName);
            if (existing) {
                return prev.map((t) =>
                    t.fileName === fileName ? { ...t, progress, mode } : t
                );
            }
            return [...prev, { fileName, progress, mode }];
        });
    };

    const removeProgress = (fileName) => {
        setTransfers((prev) => prev.filter((t) => t.fileName !== fileName));
    };

    return (
        <TransferContext.Provider value={{ transfers, updateProgress, removeProgress }}>
            {children}
        </TransferContext.Provider>
    );
}

export const useTransfer = () => useContext(TransferContext);
