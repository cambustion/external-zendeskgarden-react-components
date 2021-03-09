/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import React, {
  useState,
  useRef,
  Children,
  cloneElement,
  forwardRef,
  ReactElement,
  HTMLAttributes
} from 'react';
import PropTypes from 'prop-types';
import mergeRefs from 'react-merge-refs';
import { Modifier } from 'react-popper';
import { Button } from '@zendeskgarden/react-buttons';
import { GARDEN_PLACEMENT } from '@zendeskgarden/react-modals';
import { composeEventHandlers } from '@zendeskgarden/container-utilities';
import Chevron from '@zendeskgarden/svg-icons/src/16/chevron-down-stroke.svg';
import { Colorpicker, IColorpickerProps } from '../Colorpicker';
import { IColor } from '../../utils/types';
import {
  StyledButton,
  StyledButtonPreview,
  StyledTooltipModal,
  StyledTooltipBody
} from '../../styled';

export interface IColorpickerDialogProps extends IColorpickerProps {
  /**
   * Handles close actions. Can be triggered from the backdrop.
   *
   * @param {Object} color A color picker state
   */
  onClose?: (color: IColor) => void;
  /** Adjusts the placement of the color dialog */
  placement?: GARDEN_PLACEMENT;
  /** Disables the color dialog button */
  disabled?: boolean;
  /**
   * Modifies [Popper instance](https://popper.js.org/docs/v2/modifiers/) to customize positioning logic
   */
  popperModifiers?: Partial<Modifier<any, any>>[];
  /**
   * Sets the `z-index` of the color dialog
   */
  zIndex?: number;
  /**
   * Adds an arrow to the color dialog
   */
  hasArrow?: boolean;
  /**
   * Animates the color dialog
   */
  isAnimated?: boolean;
  /**
   * Applies inset `box-shadow` styling on focus
   */
  focusInset?: boolean;
}

/**
 * @extends HTMLAttributes<HTMLButtonElement>
 */
export const ColorpickerDialog = forwardRef<
  HTMLButtonElement,
  IColorpickerDialogProps & Omit<HTMLAttributes<HTMLButtonElement>, 'color' | 'onChange'>
>(
  (
    {
      color,
      defaultColor,
      placement,
      onChange,
      onClose,
      labels,
      hasArrow,
      isAnimated,
      popperModifiers,
      zIndex,
      focusInset,
      children,
      ...props
    },
    ref
  ) => {
    const isControlled = color !== null && color !== undefined;
    const buttonRef = useRef<HTMLButtonElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const mergedRef = mergeRefs([ref, buttonRef]);
    const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>();
    const [uncontrolledColor, setUncontrolledColor] = useState<string | IColor | undefined>(
      defaultColor
    );

    const onClick = composeEventHandlers(props.onClick, () => {
      if (referenceElement) {
        setReferenceElement(null);
      } else {
        setReferenceElement(buttonRef.current);
      }
    });

    return (
      <>
        {children ? (
          cloneElement(Children.only(children as ReactElement), {
            onClick,
            ref: mergedRef
          })
        ) : (
          <StyledButton focusInset={focusInset} ref={mergedRef} onClick={onClick} {...props}>
            <StyledButtonPreview backgroundColor={isControlled ? color : uncontrolledColor} />
            {/* eslint-disable-next-line no-eq-null, eqeqeq */}
            <Button.EndIcon isRotated={referenceElement != null}>
              <Chevron />
            </Button.EndIcon>
          </StyledButton>
        )}
        <StyledTooltipModal
          hasArrow={hasArrow}
          popperModifiers={popperModifiers}
          zIndex={zIndex}
          isAnimated={isAnimated}
          focusOnMount={false}
          placement={placement}
          referenceElement={referenceElement}
          onClose={() => {
            setReferenceElement(null);
            onClose && onClose(isControlled ? (color as IColor) : (uncontrolledColor as IColor));
          }}
        >
          <StyledTooltipBody>
            <Colorpicker
              autofocus
              color={color}
              labels={labels}
              ref={colorPickerRef}
              defaultColor={uncontrolledColor}
              onChange={isControlled ? onChange : setUncontrolledColor}
            />
          </StyledTooltipBody>
        </StyledTooltipModal>
      </>
    );
  }
);

ColorpickerDialog.propTypes = {
  placement: PropTypes.oneOf([
    'auto',
    'top',
    'top-start',
    'top-end',
    'end',
    'end-top',
    'end-bottom',
    'bottom',
    'bottom-start',
    'bottom-end',
    'start',
    'start-top',
    'start-bottom'
  ]),
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  labels: PropTypes.object,
  color: PropTypes.oneOfType<any>([PropTypes.object, PropTypes.string]),
  defaultColor: PropTypes.oneOfType<any>([PropTypes.object, PropTypes.string])
};

ColorpickerDialog.defaultProps = {
  placement: 'bottom-start',
  isAnimated: true,
  zIndex: 1000
};

ColorpickerDialog.displayName = 'ColorpickerDialog';
