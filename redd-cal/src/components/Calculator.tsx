'use client';

import React from 'react';
import Display from './Display';
import Button from './Button';
import History from './History';

type ButtonVariant = 'number' | 'operator' | 'equals' | 'function' | 'zero';

interface ButtonConfig {
  label: string;
  variant: ButtonVariant;
  action: () => void;
}

type CalcOperator = '+' | '-' | '×' | '÷' | null;

export default function Calculator() {
  const [currentInput, setCurrentInput] = React.useState('0');
  const [previousInput, setPreviousInput] = React.useState('');
  const [operator, setOperator] = React.useState<CalcOperator>(null);
  const [expression, setExpression] = React.useState('');
  const [waitingForOperand, setWaitingForOperand] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [justCalculated, setJustCalculated] = React.useState(false);

  const saveToHistory = React.useCallback(async (expr: string, result: string) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr, result }),
      });
    } catch {
      // silently fail
    }
  }, []);

  const inputDigit = React.useCallback(
    (digit: string) => {
      if (hasError) return;
      if (waitingForOperand || justCalculated) {
        setCurrentInput(digit);
        setWaitingForOperand(false);
        setJustCalculated(false);
      } else {
        setCurrentInput(prev => (prev === '0' ? digit : prev.length >= 15 ? prev : prev + digit));
      }
    },
    [hasError, waitingForOperand, justCalculated]
  );

  const inputDecimal = React.useCallback(() => {
    if (hasError) return;
    if (waitingForOperand || justCalculated) {
      setCurrentInput('0.');
      setWaitingForOperand(false);
      setJustCalculated(false);
      return;
    }
    if (!currentInput.includes('.')) {
      setCurrentInput(prev => prev + '.');
    }
  }, [hasError, waitingForOperand, justCalculated, currentInput]);

  const toggleSign = React.useCallback(() => {
    if (hasError) return;
    if (currentInput !== '0') {
      setCurrentInput(prev =>
        prev.startsWith('-') ? prev.slice(1) : '-' + prev
      );
    }
  }, [hasError, currentInput]);

  const inputPercent = React.useCallback(() => {
    if (hasError) return;
    const val = parseFloat(currentInput);
    if (isNaN(val)) return;
    setCurrentInput(String(val / 100));
  }, [hasError, currentInput]);

  const performCalculation = React.useCallback(
    (op: CalcOperator, current: string, previous: string): string => {
      const a = parseFloat(previous);
      const b = parseFloat(current);
      if (isNaN(a) || isNaN(b)) return current;
      switch (op) {
        case '+':
          return String(parseFloat((a + b).toPrecision(12)));
        case '-':
          return String(parseFloat((a - b).toPrecision(12)));
        case '×':
          return String(parseFloat((a * b).toPrecision(12)));
        case '÷':
          if (b === 0) return 'Error';
          return String(parseFloat((a / b).toPrecision(12)));
        default:
          return current;
      }
    },
    []
  );

  const handleOperator = React.useCallback(
    (op: CalcOperator) => {
      if (hasError) return;
      if (op === null) return;

      if (operator && !waitingForOperand && !justCalculated) {
        const result = performCalculation(operator, currentInput, previousInput);
        if (result === 'Error') {
          setCurrentInput('Error');
          setHasError(true);
          setExpression('');
          setPreviousInput('');
          setOperator(null);
          return;
        }
        const newExpr = `${expression} ${currentInput} ${op}`;
        setCurrentInput(result);
        setPreviousInput(result);
        setExpression(newExpr);
      } else {
        const newExpr = justCalculated
          ? `${currentInput} ${op}`
          : `${expression || currentInput} ${op}`;
        setPreviousInput(currentInput);
        setExpression(newExpr);
      }

      setOperator(op);
      setWaitingForOperand(true);
      setJustCalculated(false);
    },
    [hasError, operator, waitingForOperand, justCalculated, currentInput, previousInput, expression, performCalculation]
  );

  const handleEquals = React.useCallback(() => {
    if (hasError) return;
    if (!operator || !previousInput) return;

    const fullExpr = `${expression} ${currentInput}`;
    const result = performCalculation(operator, currentInput, previousInput);

    if (result === 'Error') {
      setCurrentInput('Error');
      setHasError(true);
      setExpression(fullExpr + ' =');
      setPreviousInput('');
      setOperator(null);
      return;
    }

    const displayExpr = `${fullExpr} =`;
    setExpression(displayExpr);
    setCurrentInput(result);
    setPreviousInput('');
    setOperator(null);
    setWaitingForOperand(false);
    setJustCalculated(true);

    saveToHistory(fullExpr, result);
  }, [hasError, operator, previousInput, currentInput, expression, performCalculation, saveToHistory]);

  const handleClear = React.useCallback(() => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperator(null);
    setExpression('');
    setWaitingForOperand(false);
    setHasError(false);
    setJustCalculated(false);
  }, []);

  const handleClearEntry = React.useCallback(() => {
    if (hasError) {
      handleClear();
      return;
    }
    setCurrentInput('0');
  }, [hasError, handleClear]);

  const handleBackspace = React.useCallback(() => {
    if (hasError || waitingForOperand || justCalculated) return;
    setCurrentInput(prev => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) return '0';
      return prev.slice(0, -1);
    });
  }, [hasError, waitingForOperand, justCalculated]);

  // Keyboard support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === '%') {
        inputPercent();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, handleBackspace, handleClear, inputPercent]);

  const buttons: ButtonConfig[] = [
    { label: 'C', variant: 'function', action: handleClear },
    { label: 'CE', variant: 'function', action: handleClearEntry },
    { label: '⌫', variant: 'function', action: handleBackspace },
    { label: '÷', variant: 'operator', action: () => handleOperator('÷') },

    { label: '7', variant: 'number', action: () => inputDigit('7') },
    { label: '8', variant: 'number', action: () => inputDigit('8') },
    { label: '9', variant: 'number', action: () => inputDigit('9') },
    { label: '×', variant: 'operator', action: () => handleOperator('×') },

    { label: '4', variant: 'number', action: () => inputDigit('4') },
    { label: '5', variant: 'number', action: () => inputDigit('5') },
    { label: '6', variant: 'number', action: () => inputDigit('6') },
    { label: '-', variant: 'operator', action: () => handleOperator('-') },

    { label: '1', variant: 'number', action: () => inputDigit('1') },
    { label: '2', variant: 'number', action: () => inputDigit('2') },
    { label: '3', variant: 'number', action: () => inputDigit('3') },
    { label: '+', variant: 'operator', action: () => handleOperator('+') },

    { label: '+/-', variant: 'function', action: toggleSign },
    { label: '0', variant: 'number', action: () => inputDigit('0') },
    { label: '.', variant: 'number', action: inputDecimal },
    { label: '%', variant: 'function', action: inputPercent },
  ];

  return (
    <>
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(145deg, #2d0000, #1a0000)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(204,0,0,0.15), inset 0 1px 0 rgba(255,68,68,0.1)',
          border: '1px solid #440000',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px',
          }}
        >
          <button
            onClick={() => setHistoryOpen(v => !v)}
            style={{
              background: historyOpen
                ? 'rgba(204,0,0,0.3)'
                : 'rgba(255,255,255,0.05)',
              color: historyOpen ? '#ff4444' : '#993333',
              border: `1px solid ${historyOpen ? '#660000' : '#440000'}`,
              borderRadius: '10px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(204,0,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = historyOpen
                ? 'rgba(204,0,0,0.3)'
                : 'rgba(255,255,255,0.05)';
            }}
          >
            📋 History
          </button>
        </div>

        {/* Display */}
        <Display
          expression={expression}
          current={currentInput}
          hasError={hasError}
        />

        {/* Equals button row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}
        >
          {buttons.map((btn, idx) => (
            <div
              key={idx}
              style={{
                gridColumn: btn.variant === 'zero' ? 'span 2' : undefined,
              }}
            >
              <Button
                label={btn.label}
                onClick={btn.action}
                variant={btn.variant}
              />
            </div>
          ))}
        </div>

        {/* Equals row */}
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={handleEquals}
            style={{
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(145deg, #cc0000, #990000)',
              color: '#ffffff',
              border: '1px solid #ff1a1a',
              borderRadius: '12px',
              fontSize: '1.5rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              boxShadow: '0 4px 12px rgba(204,0,0,0.4)',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'linear-gradient(145deg, #ff1a1a, #cc0000)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 6px 20px rgba(255,26,26,0.5)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'linear-gradient(145deg, #cc0000, #990000)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 4px 12px rgba(204,0,0,0.4)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'none';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(2px) scale(0.98)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            aria-label="equals"
          >
            =
          </button>
        </div>

        {/* Keyboard hint */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '14px',
            color: '#440000',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
          }}
        >
          Keyboard supported · Press Esc to clear
        </div>
      </div>

      {/* History Panel */}
      <History
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectEntry={result => {
          setCurrentInput(result);
          setJustCalculated(true);
          setHistoryOpen(false);
        }}
      />

      {/* Overlay when history is open */}
      {historyOpen && (
        <div
          onClick={() => setHistoryOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}
    </>
  );
}
