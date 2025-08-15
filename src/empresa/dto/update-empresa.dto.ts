export class UpdateEmpresaDto {
  empresa?: string;
  rua?: string;
  cep?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone_contato?: string;
  funcionamento?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  visualizarPreco?: boolean;
  descricao?: string;

  // imagens – envie UM dos dois por campo
  logoBrancaBase64?: string;
  logoBrancaPath?: string;

  logoVerdeBase64?: string;
  logoVerdePath?: string;

  iconBase64?: string;
  iconPath?: string;
}
