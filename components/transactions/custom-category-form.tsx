import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  user_id?: string;
}

interface NewCategory {
  name: string;
  type: 'income' | 'expense' | 'both';
}

interface CustomCategoryFormProps {
  transactionType: 'income' | 'expense';
  newCategory: NewCategory;
  setNewCategory: React.Dispatch<React.SetStateAction<NewCategory>>;
  categories: Category[];
  customCategoryError: boolean;
  isSavingCategory: boolean;
  onAddCategory: () => void;
  onDeleteCategory: (category: Category) => void;
  showDeleteCategoryConfirm: boolean;
  categoryToDelete: Category | null;
  setShowDeleteCategoryConfirm: (show: boolean) => void;
  setCategoryToDelete: (category: Category | null) => void;
  onConfirmDeleteCategory: () => void;
  isDeletingCategory: boolean;
}

export const CustomCategoryForm: React.FC<CustomCategoryFormProps> = ({
  transactionType,
  newCategory,
  setNewCategory,
  categories,
  customCategoryError,
  isSavingCategory,
  onAddCategory,
  onDeleteCategory,
  showDeleteCategoryConfirm,
  categoryToDelete,
  setShowDeleteCategoryConfirm,
  setCategoryToDelete,
  onConfirmDeleteCategory,
  isDeletingCategory,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Sync with newCategory when component mounts or when category type changes
  useEffect(() => {
    setInputValue(newCategory.name);
  }, [transactionType, newCategory.name]);

  // Filter categories to only show user's custom categories of the current type
  const userCustomCategories = useMemo(() =>
    categories.filter(c =>
      c.user_id && // Only user's custom categories
      (c.type === transactionType || c.type === 'both')
    ).sort((a, b) => a.name.localeCompare(b.name)),
  [categories, transactionType]);

  // Update parent state less frequently to avoid re-renders during typing
  const updateParentState = useCallback((value: string) => {
    const categoryType = transactionType === 'income' ? 'income' : 'expense';
    setNewCategory(prev => ({
      ...prev,
      name: value,
      type: categoryType
    }));
  }, [transactionType, setNewCategory]);

  // Handle input change locally first
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Debounce the update to parent state
    if ((e.nativeEvent as InputEvent).inputType === 'insertText' ||
        (e.nativeEvent as InputEvent).inputType === 'deleteContentBackward' ||
        (e.nativeEvent as InputEvent).inputType === 'deleteContentForward') {
      updateParentState(value);
    }
  };

  // Use useLayoutEffect to ensure DOM manipulation happens before render
  useLayoutEffect(() => {
    // Define a cleanup function that removes unwanted dropdowns
    const removeUnwantedDropdowns = () => {
      if (dropdownRef.current) {
        // Target both class patterns to ensure we remove all unwanted elements
        const unwantedDropdowns = dropdownRef.current.querySelectorAll(
          'select.flex-1.high-contrast-dropdown, select.categoryTypeDropdown, select[name="categoryType"]'
        );

        unwantedDropdowns.forEach(dropdown => {
          console.log('Removing unwanted dropdown:', dropdown);
          dropdown.remove();
        });
      }
    };

    // Run immediately and also after a short delay to catch any late additions
    removeUnwantedDropdowns();

    // Set a cleanup timer to catch any dropdowns that might appear after initial render
    const timer = setTimeout(removeUnwantedDropdowns, 100);

    return () => clearTimeout(timer);
  }, []);

  // Determine if we're creating an income or expense category
  const isIncome = transactionType === 'income';
  const categoryType = isIncome ? 'income' : 'expense';

  return (
    <div ref={dropdownRef} className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => updateParentState(inputValue)}
          placeholder={`New ${categoryType} category name`}
          className={`w-full rounded-md border-2 ${customCategoryError ? 'border-red-500' : 'border-input'} bg-transparent px-3 py-2 text-sm font-medium`}
        />

        {/* This hidden input ensures we maintain the correct category type */}
        <input
          type="hidden"
          name="categoryType"
          value={categoryType}
        />

        {/* Button for adding the category with appropriate styling */}
        <Button
          type="button"
          onClick={() => {
            // Sync the local state with parent state
            updateParentState(inputValue);

            // Then add the category
            setTimeout(() => onAddCategory(), 50);
          }}
          disabled={isSavingCategory || !inputValue.trim()}
          className={`w-full ${isIncome ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'} text-primary-foreground`}
        >
          {isSavingCategory ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2"></div>
              Saving {categoryType} Category...
            </>
          ) : (
            `Add ${categoryType} Category`
          )}
        </Button>

        {customCategoryError && (
          <p className="text-sm text-red-500">
            Please create a category or select an existing one
          </p>
        )}
      </div>

      {/* Display user's custom categories with delete option */}
      {userCustomCategories.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2">Your Custom Categories</h5>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {userCustomCategories.map(category => (
              <div key={category.id} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/50 group">
                <span className="text-sm truncate flex-1">{category.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteCategory(category)}
                >
                  <Trash className="h-3.5 w-3.5 text-red-500" />
                  <span className="sr-only">Delete {category.name}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation dialog for deleting categories */}
      {showDeleteCategoryConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold mb-2">Delete Category</h3>
            <p className="mb-4">
              Are you sure you want to delete the category "{categoryToDelete.name}"?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteCategoryConfirm(false);
                  setCategoryToDelete(null);
                }}
                disabled={isDeletingCategory}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmDeleteCategory}
                disabled={isDeletingCategory}
              >
                {isDeletingCategory ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};