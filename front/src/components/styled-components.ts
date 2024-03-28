"use client"
import styled, { css } from 'styled-components'

export const SiteHeader = styled.header`
    padding: 0 10%;
    width: 100%;
    height: 4rem;
    background-color: #ffffff;
    color: #000010;
    display: flex;
    align-items: center;
    position: fixed;
    z-index: 10;
    & div{
        margin-right: 0;
        margin-left: auto;
        display: flex;
        align-items: center;
    }
`;

export const SecondHeader = styled.header`
    width: 100%;
    height: 6rem;
    background-color: #d0e0f0;
    color: #e0e0f0;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    position: fixed;
    z-index: 8;
    box-shadow: 0px 0px 5px #00000080;
`;

export const Header1Button = styled.button < { signup?: any } >`
    width: 8rem;
    height: 3rem;
    margin-right: 12px;
    margin-left: ${({ signup }) => (signup ? '0' : 'auto')};
    padding: 4px 16px;
    border-radius: 36px;
    font-weight: bold;
    display: block;
    background-color: ${({ signup }) => (signup ? '#00a0f0' : '#d0e0f0')};
    color: ${({ signup }) => (signup ? '#ffffff' : '#000010')};
`;

export const Header2Button = styled.button`
    width: 8rem;
    height: 2rem;
    display: flex;
    margin-top: auto;
    margin-bottom: 0;
    padding: 4px 16px;
    font-weight: bold;
    color: #000010;
    text-align: center;
    align-items: center;
    transition: all 0.5s ease;
    & a{
        width: 100%;
        display: block;
        align-self: center;
    }
    &:hover{
        color: #00a0f0;
    }
`;

export const HeaderUserName = styled.button`
    width: 12rem;
    height: 3rem;
    padding: 0 12px 0 0;
    background-color: #d0e0f0;
    color: #000010;
    border-radius: 32px;
    font-weight: bold;
    display: flex;
    align-items: center;
    & a{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
    }
    & a img{
        width: 40px;
        height: 40px;
        margin: 4px;
        background-color: #ffffff;
        border-radius: 32px;
        display: block;
    }
    & a p{
        margin: 0 auto;
    }
`;

export const HeaderUserButton = styled.button< { logout?: any } >`
    height: 3rem;
    width: 3rem;
    margin-left: 12px;
    background-color: #d0e0f0;
    border-radius: 32px;
    transition: all 0.5s ease;
    &:hover {
        color: ${({ logout }) => (logout ? '#f00000' : '#00a0f0')};
    }
    & p{
        margin-top: -16px;
        font-size: 9px;
        font-weight: 800;
    }
`

export const ThirdHeader = styled.div`
    height: calc(100% - 6rem);
    width: 14rem;
    display: flex;
    position: fixed;
    margin: 0;
    left: 0;
    top: 6rem;
    & h2{
        margin: 0 6px;
        height: 3.6rem;
        display: flex;
        color: #00a0f0;
        align-items: center;
        width: 100%;
        padding: 8px;
        font-size: 18px;
        font-weight: bold;
    }
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0px 0px 10px #00000040;
`
export const Header3Button = styled.button < { selected?: any } >`
    height: 3rem;
    margin: 0 12px;
    border-radius: 12px;
    color: ${({ selected }) => (selected ? '#ffffff' : '#000010')};
    background-color: ${({ selected }) => (selected ? '#00a0f0' : '')};
    & a{
        margin: 0 10px;
        flex-direction: row;
        display: flex;
        align-items: center;
    }
    & a span{
        margin: 0 10px;
        font-size: 24px;
    }
    transition: all 0.5s ease;
    &:hover{
        color: ${({ selected }) => (selected ? '#ffffff' : '#00a0f0')};
    }
`

export const FourthHeader = styled.div`
    height: calc(100% - 6rem);
    width: 16%;
    display: flex;
    position: fixed;
    right: 0;
    & h2{
        margin: 0 6px;
        height: 3.6rem;
        display: flex;
        color: #00a0f0;
        align-items: center;
        width: 100%;
        padding: 8px;
        font-size: 18px;
        font-weight: 1000;
    }
    & table{
        margin: 0 10px;
    }
    & thead, tbody, tfoot{
        border: solid #d0d0e0;
        border-width: 2px 0;
    }
    & th, td{
        text-align: center;
        height: 2rem;
        table-layout: auto;
        border: solid #d0d0e0;
        border-width: 1px 0;
    }
    & th{
        background-color: #ddeeff;
    }
    & td{
        text-align: center;
        height: 3rem;
    }
    flex-direction: column;
    background-color: #ffffff;
    box-shadow: 0px 0px 10px #00000040;
`

export const ContestTitle = styled.div`
    padding: 32px 0 0 0;
    border-radius: 8px;
    background-color: #d0d0e0;
    & h1{
        padding: 12px 0;
        font-weight: bold;
        font-size: 32px;
    }
    & p{
        padding: 8px;
        text-align: left;
        align-self: end;
        font-size: 12px;
        color: #303040;
    }
`
