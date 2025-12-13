
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    CheckSquare,
    Type
} from 'lucide-react';

export const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    // Definitions of commands
    // We filter these in the parent extension logic normally, 
    // but for now we assume props.items provides the filtered list.

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-64 p-1 z-50">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`flex items-center gap-2 w-full text-left px-2 py-2 text-sm rounded transition-colors ${index === selectedIndex ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        key={index}
                        onClick={() => selectItem(index)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <span className="p-1 bg-white border border-gray-200 rounded shadow-sm text-gray-500">
                            {item.icon}
                        </span>
                        <div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-2 py-2 text-sm text-gray-400">No result</div>
            )}
        </div>
    );
});

CommandList.displayName = 'CommandList';
