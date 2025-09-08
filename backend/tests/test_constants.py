import pytest
from enum import Enum, IntEnum

from hermadata.constants import (
    StorageType,
    EntryType,
    ExitType,
    AnimalStage,
    AnimalSize,
    AnimalFur,
    EntryResult,
    AnimalEvent,
    ApiErrorCode,
    DocKindCode,
    RecurrenceType,
    ENTRY_TYPE_LABELS,
    EXIT_TYPE_LABELS,
    SIZE_LABELS,
    FUR_LABELS,
    ANIMAL_STAGE_LABELS,
    ENTRY_RESULT_LABELS,
    RECURRENCE_LABELS,
    EXCEL_MEDIA_TYPE,
)


class TestConstants:
    """Test cases for constants module"""
    
    def test_storage_type_enum(self):
        """Test StorageType enum values"""
        assert StorageType.disk.value == "dd"
        assert StorageType.aws_s3.value == "s3"
        assert isinstance(StorageType.disk, StorageType)
    
    def test_entry_type_enum(self):
        """Test EntryType enum values and labels"""
        # Test some key values
        assert EntryType.rescue.value == "R"
        assert EntryType.confiscation.value == "C"
        assert EntryType.private_surrender.value == "P"
        
        # Test that all entry types have labels
        for entry_type in EntryType:
            assert entry_type in ENTRY_TYPE_LABELS
            assert isinstance(ENTRY_TYPE_LABELS[entry_type], str)
            assert len(ENTRY_TYPE_LABELS[entry_type]) > 0
    
    def test_exit_type_enum(self):
        """Test ExitType enum values and labels"""
        # Test some key values
        assert ExitType.adoption.value == "A"
        assert ExitType.death.value == "D"
        assert ExitType.return_.value == "R"
        
        # Test that all exit types have labels
        for exit_type in ExitType:
            assert exit_type in EXIT_TYPE_LABELS
            assert isinstance(EXIT_TYPE_LABELS[exit_type], str)
            assert len(EXIT_TYPE_LABELS[exit_type]) > 0
    
    def test_animal_size_enum(self):
        """Test AnimalSize enum values and labels"""
        assert isinstance(AnimalSize.mini, IntEnum)
        assert AnimalSize.mini.value == 0
        assert AnimalSize.small.value == 1
        assert AnimalSize.medium.value == 2
        assert AnimalSize.big.value == 3
        
        # Test that all sizes have labels
        for size in AnimalSize:
            assert size in SIZE_LABELS
            assert isinstance(SIZE_LABELS[size], str)
            assert len(SIZE_LABELS[size]) > 0
    
    def test_animal_fur_enum(self):
        """Test AnimalFur enum values and labels"""
        assert isinstance(AnimalFur.very_short, IntEnum)
        # Test that values are auto-incremented
        assert AnimalFur.very_short.value == 1
        assert AnimalFur.short.value == 2
        
        # Test that all fur types have labels
        for fur_type in AnimalFur:
            assert fur_type in FUR_LABELS
            assert isinstance(FUR_LABELS[fur_type], str)
            assert len(FUR_LABELS[fur_type]) > 0
    
    def test_animal_stage_enum(self):
        """Test AnimalStage enum values and labels"""
        assert AnimalStage.shelter.value == "S"
        assert AnimalStage.hospital.value == "H"
        
        # Test that all stages have labels
        for stage in AnimalStage:
            assert stage in ANIMAL_STAGE_LABELS
            assert isinstance(ANIMAL_STAGE_LABELS[stage], str)
            assert len(ANIMAL_STAGE_LABELS[stage]) > 0
    
    def test_entry_result_enum(self):
        """Test EntryResult enum values and labels"""
        assert EntryResult.completed.value == "C"
        assert EntryResult.failed.value == "F"
        assert EntryResult.returned.value == "R"
        
        # Test that all results have labels
        for result in EntryResult:
            assert result in ENTRY_RESULT_LABELS
            assert isinstance(ENTRY_RESULT_LABELS[result], str)
            assert len(ENTRY_RESULT_LABELS[result]) > 0
    
    def test_animal_event_enum(self):
        """Test AnimalEvent enum values"""
        assert AnimalEvent.create.value == "CR"
        assert AnimalEvent.exit_.value == "EX"
        assert AnimalEvent.new_entry.value == "NE"
        assert AnimalEvent.entry_complete.value == "EC"
        assert AnimalEvent.data_update.value == "DU"
    
    def test_api_error_code_enum(self):
        """Test ApiErrorCode enum values"""
        assert ApiErrorCode.existing_chip_code.value == "ECC"
    
    def test_doc_kind_code_enum(self):
        """Test DocKindCode enum values"""
        assert DocKindCode.comunicazione_ingresso.value == "CI"
        assert DocKindCode.documento_ingresso.value == "IN"
        assert DocKindCode.adozione.value == "AD"
    
    def test_recurrence_type_enum(self):
        """Test RecurrenceType enum values and labels"""
        assert RecurrenceType.DAILY.value == "day"
        assert RecurrenceType.WEEKLY.value == "week"
        assert RecurrenceType.MONTHLY.value == "month"
        assert RecurrenceType.YEARLY.value == "year"
        
        # Test that all recurrence types have labels
        for recurrence_type in RecurrenceType:
            assert recurrence_type in RECURRENCE_LABELS
            assert isinstance(RECURRENCE_LABELS[recurrence_type], str)
            assert len(RECURRENCE_LABELS[recurrence_type]) > 0
    
    def test_excel_media_type_constant(self):
        """Test EXCEL_MEDIA_TYPE constant"""
        assert isinstance(EXCEL_MEDIA_TYPE, str)
        assert "application/vnd.openxmlformats-officedocument" in EXCEL_MEDIA_TYPE
        assert "application/vnd.ms-excel" in EXCEL_MEDIA_TYPE
    
    def test_enum_completeness(self):
        """Test that label dictionaries cover all enum values"""
        # Entry types
        assert len(ENTRY_TYPE_LABELS) == len(EntryType)
        
        # Exit types  
        assert len(EXIT_TYPE_LABELS) == len(ExitType)
        
        # Sizes
        assert len(SIZE_LABELS) == len(AnimalSize)
        
        # Fur types
        assert len(FUR_LABELS) == len(AnimalFur)
        
        # Stages
        assert len(ANIMAL_STAGE_LABELS) == len(AnimalStage)
        
        # Entry results
        assert len(ENTRY_RESULT_LABELS) == len(EntryResult)
        
        # Recurrence types
        assert len(RECURRENCE_LABELS) == len(RecurrenceType)
    
    def test_label_translations_are_italian(self):
        """Test that labels appear to be in Italian"""
        # Check some known Italian translations
        assert "Adozione" in EXIT_TYPE_LABELS.values()
        assert "Recupero" in ENTRY_TYPE_LABELS.values()
        assert "Rifugio" in ANIMAL_STAGE_LABELS.values()
        assert "giornaliera" in RECURRENCE_LABELS.values()