import styled, { StyledFunction } from 'styled-components';

export interface IProps {
  opacity: number;
  activeOnHover?: boolean;
}

// Hack to get the right prop types.
const styledDiv: StyledFunction<IProps & React.HTMLProps<HTMLInputElement>> =
  styled.div;

export const Block = styledDiv`
  background-color: white;
  padding: 5px 20px 10px 20px;
  margin: 15px 15px;
  box-shadow: 0px 1px 5px grey;
  cursor: ${props => {
    return props.activeOnHover ? 'pointer' : 'default';
  }};

  opacity: ${props => {
    return props.opacity ? props.opacity : 1;
  }};

  h2 {
    font-family: Arial, sans-serif;
    line-height: 1.15;
    margin: 0;
    font-size: 11pt;
    font-weight: bold;
    padding: 10px 0 5px 0;
  }

  p {
    font-family: Arial, sans-serif;
    line-height: 1.15;
    margin: 0;
    font-size: 9pt;
    padding: 0 0 10px 0;
  }
`;
